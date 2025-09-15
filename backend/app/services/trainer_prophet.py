from __future__ import annotations

from pathlib import Path
from typing import Tuple
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session

from ..db.models import HistoricalWeather, Prediction, ModelRegistry
from .historical import loc_key_from_latlon


def _load_daily_series(db: Session, *, key: str) -> pd.DataFrame:
    rows = (
        db.query(HistoricalWeather)
        .filter(HistoricalWeather.loc_key == key)
        .order_by(HistoricalWeather.ts.asc())
        .all()
    )
    if not rows:
        return pd.DataFrame()
    df = pd.DataFrame([
        {"ts": r.ts, "temp_c": r.temp_c} for r in rows if r.temp_c is not None
    ])
    if df.empty:
        return df
    # Resample to daily mean
    df = df.set_index(pd.to_datetime(df["ts"]))
    daily = df["temp_c"].resample("D").mean().dropna()
    out = pd.DataFrame({"ds": daily.index.tz_localize(None), "y": daily.values})
    return out


def _fit_prophet(daily_df: pd.DataFrame, horizon_days: int = 7) -> Tuple[pd.DataFrame, dict, object]:
    from prophet import Prophet

    # Prepare
    df = daily_df.copy()
    if "ds" not in df.columns or "y" not in df.columns:
        raise ValueError("daily_df must have columns ds and y")

    # Basic model: yearly + weekly seasonality, additive
    m = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
    m.add_country_holidays(country_name="US")
    m.fit(df)

    # Metrics (simple holdout if enough data)
    metrics = {
        "model": "prophet_v1",
        "train_points": int(len(df)),
    }
    if len(df) > 30:
        holdout = df.tail(7)
        train = df.iloc[: -len(holdout)]
        m2 = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
        m2.fit(train)
        future_ho = m2.make_future_dataframe(periods=7, freq="D", include_history=False)
        pred_ho = m2.predict(future_ho)
        y_true = holdout["y"].values
        y_pred = pred_ho["yhat"].values
        mae = float(np.mean(np.abs(y_true - y_pred)))
        mape = float(np.mean(np.abs((y_true - y_pred) / np.maximum(1e-6, np.abs(y_true)))))
        metrics.update({"mae": mae, "mape": mape})

    # Forecast
    future = m.make_future_dataframe(periods=horizon_days, freq="D", include_history=False)
    fc = m.predict(future)
    out = pd.DataFrame({
        "ds": pd.to_datetime(fc["ds"]).dt.tz_localize(None),
        "yhat": fc["yhat"].astype(float).values,
        "yhat_lower": fc["yhat_lower"].astype(float).values,
        "yhat_upper": fc["yhat_upper"].astype(float).values,
    })
    return out, metrics, m


def _ensure_model_dir(key: str) -> Path:
    base = Path("/app/models")
    p = base / key
    p.mkdir(parents=True, exist_ok=True)
    return p


def train_daily(db: Session, *, lat: float, lon: float, days: int = 7) -> int:
    key = loc_key_from_latlon(lat, lon)
    daily = _load_daily_series(db, key=key)
    if daily.empty:
        raise ValueError("No historical data available for this location")

    forecast_df, metrics, model = _fit_prophet(daily, horizon_days=days)

    # Persist artifact
    artifact_dir = _ensure_model_dir(key)
    artifact_path = artifact_dir / "prophet_daily.pkl"
    try:
        import joblib

        joblib.dump(model, artifact_path)
        metrics["artifact_path"] = str(artifact_path)
    except Exception:
        metrics["artifact_path"] = None

    # Upsert predictions: remove existing daily
    db.query(Prediction).filter(
        Prediction.loc_key == key, Prediction.horizon == "daily"
    ).delete()

    inserted = 0
    for _, row in forecast_df.iterrows():
        p = Prediction(
            loc_key=key,
            horizon="daily",
            ts=pd.to_datetime(row["ds"]).to_pydatetime().replace(tzinfo=None),
            yhat=float(row["yhat"]),
            yhat_lower=float(row["yhat_lower"]),
            yhat_upper=float(row["yhat_upper"]),
            ensemble=0,
            model_versions={"daily": "prophet_v1"},
        )
        db.add(p)
        inserted += 1

    # Registry
    reg = ModelRegistry(
        loc_key=key,
        model_type="prophet_daily",
        version=1,
        metrics=metrics,
        artifact_path=str(artifact_path),
    )
    db.add(reg)
    db.commit()
    return inserted

