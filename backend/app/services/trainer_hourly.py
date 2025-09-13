from __future__ import annotations

from typing import Tuple
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session

from ..db.models import HistoricalWeather, Prediction, ModelRegistry
from .historical import loc_key_from_latlon


def _load_hourly_series(db: Session, *, key: str) -> pd.DataFrame:
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
    df = df.set_index(pd.to_datetime(df["ts"]))
    # Ensure hourly frequency (some sources already are hourly)
    hourly = df["temp_c"].resample("H").mean().interpolate(limit=3)
    out = pd.DataFrame({"ds": hourly.index.to_pydatetime(), "y": hourly.values})
    return out


def _fit_ets_hourly(hourly_df: pd.DataFrame, horizon_hours: int = 48) -> Tuple[pd.DataFrame, dict]:
    from statsmodels.tsa.holtwinters import ExponentialSmoothing

    s = hourly_df.set_index("ds")["y"].astype(float)
    if len(s) < 24 * 7:  # at least a week
        raise ValueError("Not enough hourly history to train (need >= 168 points)")

    train = s.iloc[:-24] if len(s) > 24 * 8 else s
    model = ExponentialSmoothing(
        train,
        trend="add",
        seasonal="add",
        seasonal_periods=24,
        initialization_method="estimated",
    )
    fit = model.fit(optimized=True)
    fcast = fit.forecast(horizon_hours)
    resid = train - fit.fittedvalues.reindex(train.index).fillna(method="bfill")
    sigma = float(np.nanstd(resid)) if len(resid) else 1.0
    lower = fcast - 1.96 * sigma
    upper = fcast + 1.96 * sigma
    out = pd.DataFrame({
        "ds": fcast.index,
        "yhat": fcast.values,
        "yhat_lower": lower.values,
        "yhat_upper": upper.values,
    })
    metrics = {
        "sigma": sigma,
        "train_points": int(len(train)),
        "total_points": int(len(s)),
        "model": "ets_add_add_24",
    }
    return out, metrics


def train_hourly(db: Session, *, lat: float, lon: float, hours: int = 48) -> int:
    key = loc_key_from_latlon(lat, lon)
    hourly = _load_hourly_series(db, key=key)
    if hourly.empty:
        raise ValueError("No historical data available for this location")

    forecast_df, metrics = _fit_ets_hourly(hourly, horizon_hours=hours)

    # Remove existing hourly predictions for this key
    db.query(Prediction).filter(
        Prediction.loc_key == key, Prediction.horizon == "hourly"
    ).delete()

    inserted = 0
    for _, row in forecast_df.iterrows():
        p = Prediction(
            loc_key=key,
            horizon="hourly",
            ts=pd.to_datetime(row["ds"]).to_pydatetime().replace(tzinfo=None),
            yhat=float(row["yhat"]),
            yhat_lower=float(row["yhat_lower"]),
            yhat_upper=float(row["yhat_upper"]),
            ensemble=0,
            model_versions={"hourly": "ets_v1"},
        )
        db.add(p)
        inserted += 1

    reg = ModelRegistry(
        loc_key=key,
        model_type="hourly_ets",
        version=1,
        metrics=metrics,
        artifact_path=None,
    )
    db.add(reg)
    db.commit()
    return inserted

