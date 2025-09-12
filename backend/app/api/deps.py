from typing import Generator
from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.security import verify_password
from ..db.session import get_db
from ..db.models import User


def get_db_dep() -> Generator[Session, None, None]:
    yield from get_db()


def get_current_user(
    token: str, db: Session
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub: str = payload.get("sub")  # type: ignore
        if sub is None:
            raise JWTError("Invalid token")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.email == sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

