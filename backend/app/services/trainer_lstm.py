from __future__ import annotations

from pathlib import Path
from typing import Tuple
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from ..db.models import HistoricalWeather, Prediction, ModelRegistry
from .historical import loc_key_from_latlon


def _load_hourly_series(db: Session, *, key: str) -> pd.Series:
    rows = (
        db.query(HistoricalWeather)
        .filter(HistoricalWeather.loc_key == key)
        .order_by(HistoricalWeather.ts.asc())
        .all()
    )
    if not rows:
        return pd.Series(dtype=float)
    df = pd.DataFrame([
        {"ts": r.ts, "temp_c": r.temp_c} for r in rows if r.temp_c is not None
    ])
    if df.empty:
        return pd.Series(dtype=float)
    df = df.set_index(pd.to_datetime(df["ts"]))
    hourly = df["temp_c"].resample("H").mean().interpolate(limit=3)
    hourly.index = hourly.index.tz_localize(None)
    return hourly.astype(float)


def _windowed_dataset(series: np.ndarray, window: int) -> Tuple[np.ndarray, np.ndarray]:
    X, y = [], []
    for i in range(len(series) - window):
        X.append(series[i : i + window])
        y.append(series[i + window])  # next step
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def _ensure_model_dir(key: str) -> Path:
    base = Path("/app/models")
    p = base / key
    p.mkdir(parents=True, exist_ok=True)
    return p


def train_hourly(db: Session, *, lat: float, lon: float, hours: int = 48) -> int:
    # Lazily import TF to keep API image clean
    import tensorflow as tf
    from sklearn.preprocessing import MinMaxScaler
    import joblib

    key = loc_key_from_latlon(lat, lon)
    hourly = _load_hourly_series(db, key=key)
    if len(hourly) < 24 * 7:
        raise ValueError("Not enough hourly history (>= 168 points)")

    # Train/validation split
    values = hourly.values.reshape(-1, 1)
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(values).astype(np.float32).flatten()

    window = 72
    X, y = _windowed_dataset(scaled, window)
    if len(X) < 200:
        raise ValueError("Insufficient windowed samples for LSTM training")
    split = int(len(X) * 0.85)
    X_train, y_train = X[:split], y[:split]
    X_val, y_val = X[split:], y[split:]

    # Add channel dimension [batch, time, features]
    X_train = X_train[..., None]
    X_val = X_val[..., None]

    # Model
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(window, 1)),
        tf.keras.layers.LSTM(32, return_sequences=False),
        tf.keras.layers.Dense(1),
    ])
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3), loss="mse")

    es = tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)
    model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=50, batch_size=64, verbose=0, callbacks=[es])

    # One-step recursive forecast for `hours`
    last_window = scaled[-window:].tolist()
    preds = []
    for _ in range(hours):
        x = np.array(last_window, dtype=np.float32)[None, :, None]
        yhat_scaled = float(model.predict(x, verbose=0)[0, 0])
        preds.append(yhat_scaled)
        last_window = last_window[1:] + [yhat_scaled]

    # Inverse scale
    preds_arr = scaler.inverse_transform(np.array(preds).reshape(-1, 1)).flatten()

    # Uncertainty from validation residuals
    val_pred = model.predict(X_val, verbose=0).flatten()
    resid = y_val - val_pred
    # Convert residuals back to original units
    resid_orig = scaler.inverse_transform(resid.reshape(-1, 1)).flatten()
    sigma = float(np.nanstd(resid_orig)) if len(resid_orig) else 1.0

    # Build timestamps for future hours
    last_ts = hourly.index[-1]
    future_index = pd.date_range(last_ts + pd.Timedelta(hours=1), periods=hours, freq="H")

    lower = preds_arr - 1.96 * sigma
    upper = preds_arr + 1.96 * sigma

    # Persist artifacts
    artifact_dir = _ensure_model_dir(key)
    model_path = artifact_dir / "lstm_hourly.keras"
    scaler_path = artifact_dir / "lstm_scaler.joblib"
    model.save(model_path)
    joblib.dump(scaler, scaler_path)

    # Store predictions
    db.query(Prediction).filter(
        Prediction.loc_key == key, Prediction.horizon == "hourly"
    ).delete()

    inserted = 0
    for ts, yhat, lo, up in zip(future_index, preds_arr, lower, upper):
        p = Prediction(
            loc_key=key,
            horizon="hourly",
            ts=pd.to_datetime(ts).to_pydatetime().replace(tzinfo=None),
            yhat=float(yhat),
            yhat_lower=float(lo),
            yhat_upper=float(up),
            ensemble=0,
            model_versions={"hourly": "lstm_v1"},
        )
        db.add(p)
        inserted += 1

    reg = ModelRegistry(
        loc_key=key,
        model_type="lstm_hourly",
        version=1,
        metrics={"sigma": sigma, "train_points": int(len(X_train)), "val_points": int(len(X_val))},
        artifact_path=str(model_path),
    )
    db.add(reg)
    db.commit()
    return inserted

