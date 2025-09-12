from sqlalchemy import Column, Integer, String, DateTime, JSON, Float, func
from sqlalchemy.orm import Mapped, mapped_column

from .session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    preferences: Mapped[dict | None] = mapped_column(JSON, default=None)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())


class WeatherData(Base):
    __tablename__ = "weather_data"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    location_name: Mapped[str | None] = mapped_column(String(255), index=True)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    timestamp: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    temperature: Mapped[float | None] = mapped_column(Float)
    humidity: Mapped[float | None] = mapped_column(Float)
    pressure: Mapped[float | None] = mapped_column(Float)
    weather_condition: Mapped[str | None] = mapped_column(String(100))
    raw_data: Mapped[dict | None] = mapped_column(JSON)

