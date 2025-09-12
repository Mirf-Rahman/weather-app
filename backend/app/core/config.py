from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "Aman Skies AI Backend"
    API_V1_PREFIX: str = "/api"

    # Security
    SECRET_KEY: str = Field(default="dev-secret-change", env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h
    ALGORITHM: str = "HS256"

    # Database (default sqlite for local dev; override to Postgres via env)
    DATABASE_URL: str = Field(
        default="sqlite:///./weather_ai.db", env="DATABASE_URL"
    )

    # External services
    OPENWEATHER_API_KEY: str | None = Field(default=None, env="OPENWEATHER_API_KEY")
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")

    # CORS
    CORS_ALLOW_ORIGINS: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            os.getenv("FRONTEND_URL", "http://localhost:5173"),
        ]
    )

    class Config:
        env_file = ".env"


settings = Settings()

