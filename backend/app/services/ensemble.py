from __future__ import annotations

from typing import Tuple, Optional
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from .historical import loc_key_from_latlon
from ..db.models import Prediction, ModelRegistry, HistoricalWeather
from .trainer_daily import _fit_ets_forecast as fit_ets_daily
from .trainer_hourly import _fit_ets_hourly as fit_ets_hourly


def _load_daily_df(db: Session, key: str) -> pd.DataFrame:
    rows = (
        db.query(HistoricalWeather)
        .filter(HistoricalWeather.loc_key == key)
        .order_by(HistoricalWeather.ts.asc())
        .all()
    )
    df = pd.DataFrame([{"ts": r.ts, "temp_c": r.temp_c} for r in rows if r.temp_c is not None])
    if df.empty:
        return df
    df = df.set_index(pd.to_datetime(df["ts"]))
    daily = df["temp_c"].resample("D").mean().dropna()
    return pd.DataFrame({"ds": daily.index.tz_localize(None), "y": daily.values})


def _load_hourly_series(db: Session, key: str) -> pd.Series:
    rows = (
        db.query(HistoricalWeather)
        .filter(HistoricalWeather.loc_key == key)
        .order_by(HistoricalWeather.ts.asc())
        .all()
    )
    df = pd.DataFrame([{"ts": r.ts, "temp_c": r.temp_c} for r in rows if r.temp_c is not None])
    if df.empty:
        return pd.Series(dtype=float)
    df = df.set_index(pd.to_datetime(df["ts"]))
    hourly = df["temp_c"].resample("H").mean().interpolate(limit=3)
    hourly.index = hourly.index.tz_localize(None)
    return hourly.astype(float)


def _predict_prophet(daily_df: pd.DataFrame, days: int, *, key: str) -> Optional[pd.DataFrame]:
    """Try to load saved Prophet model; fall back to fitting if needed."""
    try:
        import joblib
        from prophet import Prophet
        from pathlib import Path
        model_path = Path("/app/models") / key / "prophet_daily.pkl"
        if model_path.exists():
            m = joblib.load(model_path)
        else:
            m = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
            m.fit(daily_df)
        future = m.make_future_dataframe(periods=days, freq="D", include_history=False)
        fc = m.predict(future)
        out = pd.DataFrame({
            "ds": pd.to_datetime(fc["ds"]).dt.tz_localize(None),
            "yhat": fc["yhat"].astype(float).values,
            "yhat_lower": fc["yhat_lower"].astype(float).values,
            "yhat_upper": fc["yhat_upper"].astype(float).values,
        })
        return out
    except Exception:
        return None


def _predict_lstm(hourly: pd.Series, hours: int, *, key: str) -> Optional[pd.DataFrame]:
    """Try to load saved LSTM + scaler; fall back to None if unavailable."""
    try:
        import tensorflow as tf
        import joblib
        import numpy as np
        from pathlib import Path
        model_dir = Path("/app/models") / key
        model_path = model_dir / "lstm_hourly.keras"
        scaler_path = model_dir / "lstm_scaler.joblib"
        if not (model_path.exists() and scaler_path.exists()):
            return None
        model = tf.keras.models.load_model(model_path)
        scaler = joblib.load(scaler_path)
        values = hourly.values.reshape(-1, 1)
        scaled = scaler.transform(values).flatten().astype(np.float32)
        window = 72
        if len(scaled) < window + 1:
            return None
        last_window = scaled[-window:].tolist()
        preds = []
        for _ in range(hours):
            x = np.array(last_window, dtype=np.float32)[None, :, None]
            yhat = float(model.predict(x, verbose=0)[0, 0])
            preds.append(yhat)
            last_window = last_window[1:] + [yhat]
        preds_arr = scaler.inverse_transform(np.array(preds).reshape(-1, 1)).flatten()

        # Uncertainty proxy: rolling std of last day
        tail = values[-24:].flatten()
        sigma = float(np.std(tail)) if len(tail) else 1.0
        last_ts = hourly.index[-1]
        future_index = pd.date_range(last_ts + pd.Timedelta(hours=1), periods=hours, freq="H")
        df = pd.DataFrame({
            "ds": future_index,
            "yhat": preds_arr,
            "yhat_lower": preds_arr - 1.96 * sigma,
            "yhat_upper": preds_arr + 1.96 * sigma,
        })
        return df
    except Exception:
        return None


def _blend(a: pd.DataFrame, b: Optional[pd.DataFrame], wa: float, wb: float) -> pd.DataFrame:
    if b is None or len(b) == 0:
        return a
    # Align by ds
    m = pd.merge(a, b, on="ds", suffixes=("_a", "_b"))
    wsum = max(1e-6, wa + wb)
    out = pd.DataFrame({
        "ds": m["ds"],
        "yhat": (wa * m["yhat_a"] + wb * m["yhat_b"]) / wsum,
        "yhat_lower": (wa * m["yhat_lower_a"] + wb * m["yhat_lower_b"]) / wsum,
        "yhat_upper": (wa * m["yhat_upper_a"] + wb * m["yhat_upper_b"]) / wsum,
    })
    return out


def build_daily_ensemble(db: Session, *, lat: float, lon: float, days: int = 7) -> int:
    key = loc_key_from_latlon(lat, lon)
    daily = _load_daily_df(db, key)
    if daily.empty:
        raise ValueError("No history for ensemble")

    # Prophet candidate
    prophet_df = _predict_prophet(daily, days, key=key)
    # ETS candidate
    ets_df, ets_metrics = fit_ets_daily(daily, horizon_days=days)

    # Weights: inverse error (fallback to equal)
    wa = 1.0
    wb = 1.0 / float(ets_metrics.get("sigma", 1.0)) if isinstance(ets_metrics, dict) else 1.0
    if prophet_df is None:
        final = ets_df
        versions = {"daily": "ets_v1"}
    else:
        final = _blend(prophet_df, ets_df, wa=1.0, wb=wb)
        versions = {"daily": "prophet_v1+ets_v1"}

    # Replace predictions with ensemble
    db.query(Prediction).filter(
        Prediction.loc_key == key, Prediction.horizon == "daily"
    ).delete()
    inserted = 0
    for _, row in final.iterrows():
        p = Prediction(
            loc_key=key,
            horizon="daily",
            ts=pd.to_datetime(row["ds"]).to_pydatetime().replace(tzinfo=None),
            yhat=float(row["yhat"]),
            yhat_lower=float(row["yhat_lower"]),
            yhat_upper=float(row["yhat_upper"]),
            ensemble=1,
            model_versions=versions,
        )
        db.add(p)
        inserted += 1

    reg = ModelRegistry(
        loc_key=key,
        model_type="ensemble_daily",
        version=1,
        metrics={"weights": {"prophet": 1.0, "ets": wb}},
        artifact_path=None,
    )
    db.add(reg)
    db.commit()
    return inserted


def build_hourly_ensemble(db: Session, *, lat: float, lon: float, hours: int = 48) -> int:
    key = loc_key_from_latlon(lat, lon)
    hourly = _load_hourly_series(db, key)
    if len(hourly) == 0:
        raise ValueError("No history for ensemble")

    # LSTM candidate (quick retrain lightweight for now)
    lstm_df = _predict_lstm(hourly, hours, key=key)
    # ETS candidate
    ets_df, ets_metrics = fit_ets_hourly(pd.DataFrame({"ds": hourly.index, "y": hourly.values}), horizon_hours=hours)

    wb = 1.0 / float(ets_metrics.get("sigma", 1.0)) if isinstance(ets_metrics, dict) else 1.0
    if lstm_df is None:
        final = ets_df
        versions = {"hourly": "ets_v1"}
    else:
        final = _blend(lstm_df, ets_df, wa=1.0, wb=wb)
        versions = {"hourly": "lstm_v1+ets_v1"}

    db.query(Prediction).filter(
        Prediction.loc_key == key, Prediction.horizon == "hourly"
    ).delete()
    inserted = 0
    for _, row in final.iterrows():
        p = Prediction(
            loc_key=key,
            horizon="hourly",
            ts=pd.to_datetime(row["ds"]).to_pydatetime().replace(tzinfo=None),
            yhat=float(row["yhat"]),
            yhat_lower=float(row["yhat_lower"]),
            yhat_upper=float(row["yhat_upper"]),
            ensemble=1,
            model_versions=versions,
        )
        db.add(p)
        inserted += 1

    reg = ModelRegistry(
        loc_key=key,
        model_type="ensemble_hourly",
        version=1,
        metrics={"weights": {"lstm": 1.0, "ets": wb}},
        artifact_path=None,
    )
    db.add(reg)
    db.commit()
    return inserted

