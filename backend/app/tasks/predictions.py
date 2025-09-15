from __future__ import annotations

from typing import Optional

from ..celery_app import celery_app
from ..db.session import SessionLocal
from ..services.historical import backfill_historical, loc_key_from_latlon
from ..services.trainer_daily import train_daily as ets_train_daily
from ..services.trainer_hourly import train_hourly as ets_train_hourly
from ..services.ensemble import build_daily_ensemble, build_hourly_ensemble

# Optional heavy trainers; import lazily
try:
    from ..services.trainer_prophet import train_daily as prophet_train_daily  # type: ignore
except Exception:  # pragma: no cover - trainer service may not have Prophet installed
    prophet_train_daily = None  # type: ignore

try:
    from ..services.trainer_lstm import train_hourly as lstm_train_hourly  # type: ignore
except Exception:  # pragma: no cover
    lstm_train_hourly = None  # type: ignore


@celery_app.task(name="app.tasks.predictions.backfill")
def backfill(lat: float, lon: float, months: int = 12) -> dict:
    db = SessionLocal()
    try:
        inserted = backfill_historical(db, lat=lat, lon=lon, months=months)
        return {"status": "ok", "inserted": inserted}
    finally:
        db.close()


@celery_app.task(name="app.tasks.predictions.train_daily")
def train_daily(lat: float, lon: float, days: int = 7, model: str = "prophet") -> dict:
    db = SessionLocal()
    try:
        # Ensure we have enough history (safe to call; upserts prevent duplicates)
        try:
            backfill_historical(db, lat=lat, lon=lon, months=6)
        except Exception:
            pass
        if model == "prophet" and prophet_train_daily is not None:
            inserted = prophet_train_daily(db, lat=lat, lon=lon, days=days)
            used = "prophet"
        else:
            inserted = ets_train_daily(db, lat=lat, lon=lon, days=days)
            used = "ets"
        # Build/refresh ensemble
        try:
            ens = build_daily_ensemble(db, lat=lat, lon=lon, days=days)
        except Exception as _:
            ens = 0
        return {"status": "ok", "inserted": inserted, "model": used, "ensemble": ens}
    finally:
        db.close()


@celery_app.task(name="app.tasks.predictions.train_hourly")
def train_hourly(lat: float, lon: float, hours: int = 48, model: str = "lstm") -> dict:
    db = SessionLocal()
    try:
        # Ensure we have enough history first (>= 168 points)
        try:
            backfill_historical(db, lat=lat, lon=lon, months=6)
        except Exception:
            pass
        if model == "lstm" and lstm_train_hourly is not None:
            inserted = lstm_train_hourly(db, lat=lat, lon=lon, hours=hours)
            used = "lstm"
        else:
            inserted = ets_train_hourly(db, lat=lat, lon=lon, hours=hours)
            used = "ets"
        # Build/refresh ensemble
        try:
            ens = build_hourly_ensemble(db, lat=lat, lon=lon, hours=hours)
        except Exception as _:
            ens = 0
        return {"status": "ok", "inserted": inserted, "model": used, "ensemble": ens}
    finally:
        db.close()


@celery_app.task(name="app.tasks.predictions.maintenance")
def maintenance() -> dict:
    """Periodic maintenance: retrain models for known locations."""
    from ..db.models import ModelRegistry, HistoricalWeather

    db = SessionLocal()
    try:
        locs = set()
        for (k,) in db.query(ModelRegistry.loc_key).distinct().all():
            if k:
                locs.add(k)
        for (k,) in db.query(HistoricalWeather.loc_key).distinct().limit(20).all():
            if k:
                locs.add(k)
    finally:
        db.close()

    # Retention policy (hours)
    import datetime as _dt
    from ..db.models import Prediction

    count = 0
    for key in list(locs)[:50]:  # cap to avoid overload
        try:
            lat_str, lon_str = key.split(",")
            lat = float(lat_str)
            lon = float(lon_str)
            celery_app.send_task(
                "app.tasks.predictions.train_daily",
                kwargs={"lat": lat, "lon": lon, "days": 7, "model": "prophet"},
                queue="predictions",
            )
            celery_app.send_task(
                "app.tasks.predictions.train_hourly",
                kwargs={"lat": lat, "lon": lon, "hours": 48, "model": "lstm"},
                queue="predictions",
            )
            count += 1
        except Exception:
            continue

    # Retention: keep recent windows only
    db2 = SessionLocal()
    try:
        now = _dt.datetime.utcnow()
        hourly_cutoff = now - _dt.timedelta(days=10)  # keep last 10 days of hourly
        daily_cutoff = now - _dt.timedelta(days=60)   # keep last 60 days of daily
        db2.query(Prediction).filter(Prediction.horizon == "hourly", Prediction.ts < hourly_cutoff).delete()
        db2.query(Prediction).filter(Prediction.horizon == "daily", Prediction.ts < daily_cutoff).delete()
        db2.commit()
    finally:
        db2.close()

    return {"scheduled": count, "retention": {"hourly_days": 10, "daily_days": 60}}
