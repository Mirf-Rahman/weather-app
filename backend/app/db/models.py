from sqlalchemy import Column, Integer, String, DateTime, JSON, Float, func, Index
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


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    tags: Mapped[list | None] = mapped_column(JSON, default=list)
    # Simple constraints for weather suitability (metric units)
    temp_min: Mapped[float | None] = mapped_column(Float, default=None)
    temp_max: Mapped[float | None] = mapped_column(Float, default=None)
    wind_max: Mapped[float | None] = mapped_column(Float, default=None)  # m/s
    humidity_max: Mapped[float | None] = mapped_column(Float, default=None)
    allowed_conditions: Mapped[list | None] = mapped_column(JSON, default=list)


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    activity_key: Mapped[str] = mapped_column(String(100), index=True)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())


class HistoricalWeather(Base):
    __tablename__ = "historical_weather"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    loc_key: Mapped[str] = mapped_column(String(64), index=True)
    ts: Mapped[str] = mapped_column(DateTime(timezone=False), index=True)  # UTC
    temp_c: Mapped[float | None] = mapped_column(Float)
    humidity: Mapped[float | None] = mapped_column(Float)
    pressure: Mapped[float | None] = mapped_column(Float)
    wind_speed: Mapped[float | None] = mapped_column(Float)  # m/s
    condition: Mapped[str | None] = mapped_column(String(64))
    source: Mapped[str] = mapped_column(String(32), default="meteostat")


# Composite indexes for faster queries
Index("ix_hist_loc_ts", HistoricalWeather.loc_key, HistoricalWeather.ts)


class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    loc_key: Mapped[str] = mapped_column(String(64), index=True)
    model_type: Mapped[str] = mapped_column(String(32))  # 'lstm' | 'prophet'
    version: Mapped[int] = mapped_column(Integer, default=1)
    trained_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    metrics: Mapped[dict | None] = mapped_column(JSON, default=None)
    artifact_path: Mapped[str | None] = mapped_column(String(256))


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    loc_key: Mapped[str] = mapped_column(String(64), index=True)
    horizon: Mapped[str] = mapped_column(String(16))  # 'hourly' | 'daily'
    ts: Mapped[str] = mapped_column(DateTime(timezone=False), index=True)  # target timestamp
    yhat: Mapped[float] = mapped_column(Float)
    yhat_lower: Mapped[float | None] = mapped_column(Float)
    yhat_upper: Mapped[float | None] = mapped_column(Float)
    ensemble: Mapped[bool] = mapped_column(Integer, default=1)  # 1/0
    model_versions: Mapped[dict | None] = mapped_column(JSON, default=None)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())


# Composite indexes for predictions
Index("ix_pred_loc_hor_ts", Prediction.loc_key, Prediction.horizon, Prediction.ts)
