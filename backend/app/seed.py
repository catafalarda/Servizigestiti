from sqlalchemy.orm import Session

from .auth import get_password_hash
from .models import Role, User


def seed_users(db: Session):
    if db.query(User).count() > 0:
        return

    users = [
        User(
            username="manager",
            full_name="Mario Service Manager",
            role=Role.SERVICE_MANAGER,
            hashed_password=get_password_hash("manager123"),
        ),
        User(
            username="leader",
            full_name="Laura Team Leader",
            role=Role.TEAM_LEADER,
            hashed_password=get_password_hash("leader123"),
        ),
        User(
            username="operatore1",
            full_name="Luca Operatore",
            role=Role.OPERATOR,
            hashed_password=get_password_hash("operator123"),
        ),
        User(
            username="operatore2",
            full_name="Giulia Sistemista",
            role=Role.OPERATOR,
            hashed_password=get_password_hash("operator123"),
        ),
    ]
    db.add_all(users)
    db.commit()
