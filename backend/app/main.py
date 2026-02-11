from datetime import date
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import and_
from sqlalchemy.orm import Session

from .auth import authenticate_user, create_access_token, get_current_user, require_roles
from .db import Base, engine, get_db, SessionLocal
from .models import ActivityDefinition, ActivityKind, DailyAssignment, ExecutionLog, Frequency, Role, User
from .schemas import (
    ActivityCreate,
    ActivityOut,
    AssignmentCreate,
    AssignmentOut,
    AuthResponse,
    ExecutionCreate,
    ExecutionOut,
    LoginRequest,
    UserOut,
)
from .seed import seed_users

app = FastAPI(title="Managed Services Checklist MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
app.mount("/assets", StaticFiles(directory=frontend_dir), name="assets")


def activity_active_on(day: date, activity: ActivityDefinition) -> bool:
    if activity.kind == ActivityKind.SPECIFIC:
        if activity.specific_date:
            return activity.specific_date == day
        if activity.start_date and activity.end_date:
            return activity.start_date <= day <= activity.end_date
        return False

    if not activity.reference_date:
        return False

    if day < activity.reference_date:
        return False

    if activity.end_date and day > activity.end_date:
        return False

    if activity.frequency == Frequency.DAILY:
        return True
    if activity.frequency == Frequency.WEEKLY:
        return day.weekday() == activity.reference_date.weekday()
    if activity.frequency == Frequency.MONTHLY:
        return day.day == activity.reference_date.day
    if activity.frequency == Frequency.RECURRING:
        delta = (day - activity.reference_date).days
        return delta % activity.recurring_every_days == 0

    return False


def latest_execution(assignment_id: int, db: Session):
    return (
        db.query(ExecutionLog)
        .filter(ExecutionLog.assignment_id == assignment_id)
        .order_by(ExecutionLog.created_at.desc())
        .first()
    )


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()


@app.get("/")
def root():
    return FileResponse(frontend_dir / "index.html")


@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username/password")
    token = create_access_token({"sub": user.username})
    return AuthResponse(access_token=token, user=user)


@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@app.get("/api/users", response_model=list[UserOut])
def users_for_assignment(
    _: User = Depends(require_roles(Role.SERVICE_MANAGER, Role.TEAM_LEADER)),
    db: Session = Depends(get_db),
):
    return db.query(User).filter(User.role == Role.OPERATOR).all()


@app.post("/api/activities", response_model=ActivityOut)
def create_activity(
    payload: ActivityCreate,
    user: User = Depends(require_roles(Role.SERVICE_MANAGER, Role.TEAM_LEADER)),
    db: Session = Depends(get_db),
):
    activity = ActivityDefinition(**payload.model_dump(), created_by_id=user.id)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@app.get("/api/activities/daily", response_model=list[ActivityOut])
def get_activities_for_day(
    day: date,
    _: User = Depends(require_roles(Role.SERVICE_MANAGER, Role.TEAM_LEADER)),
    db: Session = Depends(get_db),
):
    activities = db.query(ActivityDefinition).all()
    return [activity for activity in activities if activity_active_on(day, activity)]


@app.post("/api/assignments", response_model=list[AssignmentOut])
def assign_activities(
    payload: AssignmentCreate,
    user: User = Depends(require_roles(Role.SERVICE_MANAGER, Role.TEAM_LEADER)),
    db: Session = Depends(get_db),
):
    activity = db.query(ActivityDefinition).filter(ActivityDefinition.id == payload.activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    created_assignments = []
    for user_id in payload.user_ids:
        existing = (
            db.query(DailyAssignment)
            .filter(
                and_(
                    DailyAssignment.activity_id == payload.activity_id,
                    DailyAssignment.user_id == user_id,
                    DailyAssignment.assignment_date == payload.assignment_date,
                )
            )
            .first()
        )
        if existing:
            created_assignments.append(existing)
            continue

        assignment = DailyAssignment(
            activity_id=payload.activity_id,
            user_id=user_id,
            assignment_date=payload.assignment_date,
            assigned_by_id=user.id,
        )
        db.add(assignment)
        created_assignments.append(assignment)

    db.commit()
    for assignment in created_assignments:
        db.refresh(assignment)

    result = []
    for assignment in created_assignments:
        result.append(
            AssignmentOut(
                id=assignment.id,
                assignment_date=assignment.assignment_date,
                activity=assignment.activity,
                user=assignment.user,
            )
        )
    return result


@app.get("/api/operator/tasks", response_model=list[AssignmentOut])
def operator_tasks(
    day: date,
    user: User = Depends(require_roles(Role.OPERATOR)),
    db: Session = Depends(get_db),
):
    assignments = (
        db.query(DailyAssignment)
        .filter(and_(DailyAssignment.assignment_date == day, DailyAssignment.user_id == user.id))
        .all()
    )

    output = []
    for assignment in assignments:
        log = latest_execution(assignment.id, db)
        output.append(
            AssignmentOut(
                id=assignment.id,
                assignment_date=assignment.assignment_date,
                activity=assignment.activity,
                user=assignment.user,
                latest_status=log.status if log else None,
                latest_note=log.notes if log else None,
                latest_timestamp=log.created_at if log else None,
            )
        )
    return output


@app.post("/api/executions", response_model=ExecutionOut)
def execute_activity(
    payload: ExecutionCreate,
    user: User = Depends(require_roles(Role.OPERATOR)),
    db: Session = Depends(get_db),
):
    assignment = db.query(DailyAssignment).filter(DailyAssignment.id == payload.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your assignment")

    log = ExecutionLog(
        assignment_id=payload.assignment_id,
        executed_by_id=user.id,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@app.get("/api/assignments/{assignment_id}/logs", response_model=list[ExecutionOut])
def assignment_logs(
    assignment_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = (
        db.query(ExecutionLog)
        .filter(ExecutionLog.assignment_id == assignment_id)
        .order_by(ExecutionLog.created_at.desc())
        .all()
    )
    return logs
