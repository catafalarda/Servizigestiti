from datetime import date, datetime

from pydantic import BaseModel, Field

from .models import ActivityKind, ExecutionStatus, Frequency, Role


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    role: Role

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    user: UserOut


class ActivityCreate(BaseModel):
    title: str
    description: str = ""
    kind: ActivityKind
    frequency: Frequency = Frequency.NONE
    reference_date: date | None = None
    specific_date: date | None = None
    start_date: date | None = None
    end_date: date | None = None
    recurring_every_days: int = Field(default=1, ge=1)


class ActivityOut(BaseModel):
    id: int
    title: str
    description: str
    kind: ActivityKind
    frequency: Frequency
    reference_date: date | None
    specific_date: date | None
    start_date: date | None
    end_date: date | None

    class Config:
        from_attributes = True


class AssignmentCreate(BaseModel):
    activity_id: int
    user_ids: list[int]
    assignment_date: date


class AssignmentOut(BaseModel):
    id: int
    assignment_date: date
    activity: ActivityOut
    user: UserOut
    latest_status: ExecutionStatus | None = None
    latest_note: str | None = None
    latest_timestamp: datetime | None = None


class ExecutionCreate(BaseModel):
    assignment_id: int
    status: ExecutionStatus
    notes: str = ""


class ExecutionOut(BaseModel):
    id: int
    status: ExecutionStatus
    notes: str
    created_at: datetime
    executed_by: UserOut

    class Config:
        from_attributes = True
