from ..celery_app import celery_app
from ..services.weather_collector import fetch_current_weather
import asyncio


@celery_app.task
def collect_current_weather(lat: float, lon: float, units: str = "metric"):
    return asyncio.run(fetch_current_weather(lat, lon, units))

