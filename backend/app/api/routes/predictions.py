from fastapi import APIRouter, Depends, HTTPException
import traceback
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from ...db.session import get_db
from ...services.historical import backfill_historical, loc_key_from_latlon
from ...db.models import HistoricalWeather, Prediction, ModelRegistry
from ...services.trainer_daily import train_daily
from ...services.trainer_hourly import train_hourly
from ...celery_app import celery_app


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



@router.get("/historical_series")
def historical_series(lat: float, lon: float, hours: int = 48, db: Session = Depends(get_db)):
    key = loc_key_from_latlon(lat, lon)
    q = (
        db.query(HistoricalWeather)
        .filter(HistoricalWeather.loc_key == key)
        .order_by(HistoricalWeather.ts.desc())
        .limit(max(1, hours))
        .all()
    )
    series = [
        {"ts": r.ts.isoformat() if hasattr(r.ts, "isoformat") else str(r.ts), "temp_c": r.temp_c}
        for r in reversed(q)
        if r.temp_c is not None
    ]
    return series

@router.get("/metrics")
def metrics(lat: float, lon: float, db: Session = Depends(get_db)):
    key = loc_key_from_latlon(lat, lon)
    regs = db.query(ModelRegistry).filter(ModelRegistry.loc_key == key).order_by(ModelRegistry.trained_at.desc()).all()
    out = [
        {
            "model_type": r.model_type,
            "version": r.version,
            "trained_at": r.trained_at.isoformat() if hasattr(r.trained_at, "isoformat") else str(r.trained_at),
            "metrics": r.metrics,
        }
        for r in regs
    ]
    return {"loc_key": key, "models": out}


class TrainAsyncRequest(BaseModel):
    lat: float
    lon: float
    horizon: str  # 'daily' | 'hourly'
    model: Optional[str] = None  # 'prophet'|'lstm'|'ets'
    days: int = 7
    hours: int = 48


@router.post("/train_async")
def train_async(req: TrainAsyncRequest):
    if req.horizon == "daily":
        model = req.model or "prophet"
        async_result = celery_app.send_task(
            "app.tasks.predictions.train_daily",
            kwargs={"lat": req.lat, "lon": req.lon, "days": req.days, "model": model},
            queue="predictions",
        )
    else:
        model = req.model or "lstm"
        async_result = celery_app.send_task(
            "app.tasks.predictions.train_hourly",
            kwargs={"lat": req.lat, "lon": req.lon, "hours": req.hours, "model": model},
            queue="predictions",
        )
    return {"task_id": async_result.id, "status": "queued"}


@router.get("/status")
def status(id: str):
    res = celery_app.AsyncResult(id)
    out = {"id": id, "state": res.state}
    if res.successful():
        out["result"] = res.result
    elif res.failed():
        try:
            out["error"] = str(res.result)
        except Exception:
            out["error"] = "failed"
    return out


@router.get("/available")
def available(lat: float, lon: float, horizon: str, db: Session = Depends(get_db)):
    key = loc_key_from_latlon(lat, lon)
    q = db.query(Prediction).filter(Prediction.loc_key == key, Prediction.horizon == horizon).count()
    return {"loc_key": key, "horizon": horizon, "count": int(q)}


@router.get("/health")
def worker_health():
    try:
        res = celery_app.control.ping(timeout=2.0)
        worker_up = bool(res)
    except Exception:
        worker_up = False
    return {"worker": worker_up}
