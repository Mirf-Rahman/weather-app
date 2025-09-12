from typing import Any, Dict, Optional
import httpx

from ..core.config import settings


async def fetch_current_weather(lat: float, lon: float, units: str = "metric") -> Dict[str, Any]:
    if not settings.OPENWEATHER_API_KEY:
        raise RuntimeError("OPENWEATHER_API_KEY not configured")
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": units,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get("https://api.openweathermap.org/data/2.5/weather", params=params)
        r.raise_for_status()
        return r.json()

