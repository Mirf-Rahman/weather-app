from fastapi import APIRouter, Depends, HTTPException
import traceback
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from ...db.session import get_db
from ...services.historical import backfill_historical, loc_key_from_latlon
from ...db.models import HistoricalWeather, Prediction
from ...services.trainer_daily import train_daily
from ...services.trainer_hourly import train_hourly


router = APIRouter(prefix="/predictions", tags=["predictions"])


class BackfillRequest(BaseModel):
    lat: float
    lon: float
    months: int = Field(default=12, ge=1, le=60)
    sync: bool = True  # for now, run inline; we can switch to Celery later


@router.post("/backfill")
def backfill(req: BackfillRequest, db: Session = Depends(get_db)):
    try:
        inserted = backfill_historical(db, lat=req.lat, lon=req.lon, months=req.months)
        key = loc_key_from_latlon(req.lat, req.lon)
        count = db.query(HistoricalWeather).filter(HistoricalWeather.loc_key == key).count()
        return {"status": "ok", "inserted": inserted, "total": count, "loc_key": key}
    except Exception as e:
        tb = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Backfill failed: {e}; TB: {tb}")


@router.get("/historical_count")
def historical_count(lat: float, lon: float, db: Session = Depends(get_db)):
    key = loc_key_from_latlon(lat, lon)
    count = db.query(HistoricalWeather).filter(HistoricalWeather.loc_key == key).count()
    return {"loc_key": key, "count": count}


class PredictionsQuery(BaseModel):
    lat: float
    lon: float
    horizon: str = Field(pattern="^(hourly|daily)$")
    window: Optional[int] = None  # hours for hourly, days for daily


@router.post("")
def get_predictions(req: PredictionsQuery, db: Session = Depends(get_db)):
    key = loc_key_from_latlon(req.lat, req.lon)
    if req.horizon == "hourly":
        limit = req.window or 48
    else:
        limit = req.window or 7
    q = (
        db.query(Prediction)
        .filter(Prediction.loc_key == key, Prediction.horizon == req.horizon)
        .order_by(Prediction.ts.asc())
        .limit(limit)
        .all()
    )
    return [
        {
            "ts": p.ts.isoformat() if hasattr(p.ts, "isoformat") else str(p.ts),
            "yhat": p.yhat,
            "yhat_lower": p.yhat_lower,
            "yhat_upper": p.yhat_upper,
            "ensemble": bool(p.ensemble),
            "model_versions": p.model_versions,
        }
        for p in q
    ]


class TrainRequest(BaseModel):
    lat: float
    lon: float
    horizon: str  # 'daily' | 'hourly'
    days: int = 7
    hours: int = 48


@router.post("/train")
def train(req: TrainRequest, db: Session = Depends(get_db)):
    try:
        if req.horizon == "daily":
            inserted = train_daily(db, lat=req.lat, lon=req.lon, days=req.days)
        else:
            inserted = train_hourly(db, lat=req.lat, lon=req.lon, hours=req.hours)
        key = loc_key_from_latlon(req.lat, req.lon)
        return {"status": "ok", "loc_key": key, "inserted": inserted, "horizon": req.horizon}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Train failed: {e}")

