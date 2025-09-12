from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...db.session import get_db
from ...db.models import WeatherData
from ...schemas.weather import WeatherIngest, WeatherOut

router = APIRouter(prefix="/weather", tags=["weather"])


@router.post("/ingest", response_model=WeatherOut)
def ingest_weather(payload: WeatherIngest, db: Session = Depends(get_db)):
    entry = WeatherData(
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        temperature=payload.temperature,
        humidity=payload.humidity,
        pressure=payload.pressure,
        weather_condition=payload.weather_condition,
        raw_data=payload.raw_data,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/latest", response_model=List[WeatherOut])
def latest_weather(location_name: str | None = None, db: Session = Depends(get_db)):
    q = db.query(WeatherData)
    if location_name:
        q = q.filter(WeatherData.location_name == location_name)
    q = q.order_by(WeatherData.timestamp.desc())
    return q.limit(10).all()

