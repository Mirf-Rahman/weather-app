from celery import Celery
from .core.config import settings


celery_app = Celery(
    "aman_skies_ai",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

# Basic config; expand later
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task
def ping() -> str:
    return "pong"

