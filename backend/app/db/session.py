from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from ..core.config import settings


class Base(DeclarativeBase):
    pass


# Engine
engine = create_engine(
    settings.DATABASE_URL,
    future=True,
    pool_pre_ping=True,
)

# Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

