import enum
from datetime import datetime, date

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Role(str, enum.Enum):
    SERVICE_MANAGER = "service_manager"
    TEAM_LEADER = "team_leader"
    OPERATOR = "operator"


class ActivityKind(str, enum.Enum):
    PROGRAMMED = "programmed"
    SPECIFIC = "specific"


class Frequency(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    RECURRING = "recurring"
    NONE = "none"


class ExecutionStatus(str, enum.Enum):
    OK = "OK"
    KO = "KO"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(Enum(Role), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class ActivityDefinition(Base):
    __tablename__ = "activity_definitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    kind: Mapped[ActivityKind] = mapped_column(Enum(ActivityKind), nullable=False)
    frequency: Mapped[Frequency] = mapped_column(Enum(Frequency), default=Frequency.NONE, nullable=False)
    reference_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    specific_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    recurring_every_days: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    created_by = relationship("User")


class DailyAssignment(Base):
    __tablename__ = "daily_assignments"
    __table_args__ = (UniqueConstraint("activity_id", "user_id", "assignment_date", name="uq_assignment"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    activity_id: Mapped[int] = mapped_column(ForeignKey("activity_definitions.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    assignment_date: Mapped[date] = mapped_column(Date, nullable=False)
    assigned_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    activity = relationship("ActivityDefinition")
    user = relationship("User", foreign_keys=[user_id])
    assigned_by = relationship("User", foreign_keys=[assigned_by_id])


class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    assignment_id: Mapped[int] = mapped_column(ForeignKey("daily_assignments.id"), nullable=False)
    executed_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[ExecutionStatus] = mapped_column(Enum(ExecutionStatus), nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    assignment = relationship("DailyAssignment")
    executed_by = relationship("User")
