from __future__ import annotations

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
    out = pd.DataFrame({"ds": daily.index.to_pydatetime(), "y": daily.values})
    return out


def _fit_ets_forecast(daily_df: pd.DataFrame, horizon_days: int = 7) -> Tuple[pd.DataFrame, dict]:
    """Fit a lightweight Holt-Winters seasonal model and forecast horizon.
    Returns forecast dataframe with columns: ds, yhat, yhat_lower, yhat_upper
    and metrics dict.
    """
    from statsmodels.tsa.holtwinters import ExponentialSmoothing

    # Normalize columns defensively
    df = daily_df.copy()
    if "ds" not in df.columns:
        # Try common alternatives
        if "ts" in df.columns:
            df = df.rename(columns={"ts": "ds"})
        else:
            # Assume first column is datetime
            df = df.rename(columns={df.columns[0]: "ds"})
    if "y" not in df.columns:
        # Try common alternatives
        if "temp_c" in df.columns:
            df = df.rename(columns={"temp_c": "y"})
        else:
            # Assume second column is value
            if len(df.columns) >= 2:
                df = df.rename(columns={df.columns[1]: "y"})

    # Prepare series
    s = df.set_index("ds")["y"].astype(float)
    # Basic sanity for length
    if len(s) < 21:  # need at least 3 weeks
        raise ValueError("Not enough daily history to train (need >= 21 points)")

    # Split last 7 days for validation
    train = s.iloc[:-7] if len(s) > 28 else s
    model = ExponentialSmoothing(
        train,
        trend="add",
        seasonal="add",
        seasonal_periods=7,
        initialization_method="estimated",
    )
    fit = model.fit(optimized=True)
    # Forecast future
    fcast = fit.forecast(horizon_days)
    # Simple uncertainty: use residual std and 95% band
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
        "model": "ets_add_add_7",
    }
    return out, metrics


def train_daily(db: Session, *, lat: float, lon: float, days: int = 7) -> int:
    key = loc_key_from_latlon(lat, lon)
    daily = _load_daily_series(db, key=key)
    if daily.empty:
        raise ValueError("No historical data available for this location")

    forecast_df, metrics = _fit_ets_forecast(daily, horizon_days=days)

    # Remove existing daily predictions for this key
    db.query(Prediction).filter(
        Prediction.loc_key == key, Prediction.horizon == "daily"
    ).delete()

    # Insert predictions
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
            model_versions={"daily": "ets_v1"},
        )
        db.add(p)
        inserted += 1

    # Update registry
    reg = ModelRegistry(
        loc_key=key,
        model_type="daily_ets",
        version=1,
        metrics=metrics,
        artifact_path=None,
    )
    db.add(reg)
    db.commit()
    return inserted
