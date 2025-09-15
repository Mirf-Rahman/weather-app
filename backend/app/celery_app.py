from celery import Celery
from .core.config import settings
from celery.schedules import crontab


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
    task_routes={
        "app.tasks.predictions.*": {"queue": "predictions"},
        "app.tasks.weather.*": {"queue": "default"},
    },
    beat_schedule={
        # Daily maintenance retrain at 03:00 UTC
        "predictions-maintenance-daily": {
            "task": "app.tasks.predictions.maintenance",
            "schedule": crontab(minute=0, hour=3),
        },
    },
)


@celery_app.task
def ping() -> str:
    return "pong"

# Ensure tasks are registered when worker starts
try:  # pragma: no cover
    import app.tasks.predictions  # noqa: F401
    import app.tasks.weather  # noqa: F401
except Exception:
    # In API container, trainer tasks may be unavailable; ignore
    pass
