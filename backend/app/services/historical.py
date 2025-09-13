from __future__ import annotations

from datetime import timedelta, date
from typing import Optional

from meteostat import Hourly, Point
import pandas as pd
import httpx

from sqlalchemy.orm import Session
from ..db.models import HistoricalWeather


def loc_key_from_latlon(lat: float, lon: float, precision: int = 3) -> str:
    return f"{round(lat, precision)},{round(lon, precision)}"


def _condition_from_code(code: Optional[int]) -> str:
    # Meteostat weather condition codes (coco). Map to coarse OpenWeather-like groups.
    if code is None:
        return "Unknown"
    # Very coarse mapping
    if code in {1, 2, 3}:  # clear/mostly clear/partly cloudy
        return "Clear"
    if code in {4, 5, 6, 7}:  # cloudy
        return "Clouds"
    if code in {8, 9, 10, 11, 12}:  # fog/mist
        return "Mist"
    if code in {13, 14, 15, 16, 17}:  # drizzle/rain
        return "Rain"
    if code in {18, 19, 20}:  # freezing rain/sleet
        return "Snow"
    if code in {21, 22}:  # snow
        return "Snow"
    if code in {23, 24}:  # showers/heavy showers
        return "Rain"
    if code in {25, 26}:  # thunderstorm
        return "Thunderstorm"
    return "Unknown"


def _fetch_meteostat(lat: float, lon: float, start: pd.Timestamp, end: pd.Timestamp) -> pd.DataFrame:
    point = Point(lat, lon)
    return Hourly(point, start, end).fetch()


def _fetch_open_meteo(lat: float, lon: float, start: date, end: date) -> pd.DataFrame:
    # Open-Meteo ERA5 hourly archive (no key). Limit to max 31 days per request.
    # We'll split into chunks if needed and concatenate.
    cols = [
        "temperature_2m",
        "relative_humidity_2m",
        "surface_pressure",
        "windspeed_10m",
        "weather_code",
    ]
    out = []
    s = start
    while s < end:
        e = min(s + timedelta(days=31), end)
        url = (
            "https://archive-api.open-meteo.com/v1/era5"
            f"?latitude={lat}&longitude={lon}&start_date={s}&end_date={e}"
            "&hourly=temperature_2m,relative_humidity_2m,surface_pressure,windspeed_10m,weather_code&timezone=UTC"
        )
        with httpx.Client(timeout=30) as client:
            r = client.get(url)
            r.raise_for_status()
            data = r.json()
        times = data.get("hourly", {}).get("time", [])
        if not times:
            s = e
            continue
        df = pd.DataFrame({k: data["hourly"].get(k, []) for k in data["hourly"].keys()})
        # Normalize names to meteostat-like
        df = df.rename(
            columns={
                "time": "ts",
                "temperature_2m": "temp_c",
                "relative_humidity_2m": "humidity",
                "surface_pressure": "pressure",
                "windspeed_10m": "wind_speed",
                "weather_code": "coco",
            }
        )
        df["ts"] = pd.to_datetime(df["ts"], utc=True)
        out.append(df)
        s = e
    if not out:
        return pd.DataFrame()
    return pd.concat(out, ignore_index=True)


def backfill_historical(db: Session, *, lat: float, lon: float, months: int = 12) -> int:
    """Fetch hourly historical weather using Meteostat and store in DB.

    Returns number of rows inserted or upserted.
    """
    # Build pure date range to avoid tz offset issues entirely
    end_d: date = date.today()
    start_d: date = end_d - timedelta(days=int(months * 30.5))
    # Use Open-Meteo archive (no API key) for backfill
    df = _fetch_open_meteo(lat, lon, start_d, end_d)
    if df.empty:
        return 0

    # Normalize columns
    # df columns usually: temp (°C), dwpt, rhum (%), prcp, snow, wdir, wspd (km/h?), wpgt, pres (hPa), tsun, coco
    # Meteostat wspd is in km/h, convert to m/s (divide by 3.6)
    if "temp" in df.columns:
        df = df.rename(columns={"temp": "temp_c"})
    if "rhum" in df.columns:
        df = df.rename(columns={"rhum": "humidity"})
    if "pres" in df.columns:
        df = df.rename(columns={"pres": "pressure"})
    if "wspd" in df.columns:
        df = df.rename(columns={"wspd": "wspd_kmh"})
    if "wspd_kmh" in df.columns:
        df["wind_speed"] = (df["wspd_kmh"].astype(float).fillna(0.0)) / 3.6
    elif "wind_speed" not in df.columns:
        df["wind_speed"] = 0.0

    df["condition"] = df["coco"].apply(_condition_from_code) if "coco" in df.columns else "Unknown"
    # Ensure timestamp column present
    if "ts" not in df.columns:
        # Meteostat returns index as datetime named 'time'
        if df.index.name in ("time", None):
            df = df.reset_index().rename(columns={"time": "ts"})
        else:
            df = df.reset_index().rename(columns={df.index.name or "index": "ts"})
    # Keep ts in final selection
    df = df[["ts", "temp_c", "humidity", "pressure", "wind_speed", "condition"]]

    key = loc_key_from_latlon(lat, lon)

    if "ts" not in df.columns:
        raise ValueError(f"ts column missing in normalized dataframe; columns={list(df.columns)}")

    inserted = 0
    # Upsert row-by-row to avoid dependency on dialect-specific ON CONFLICT for now
    for _, row in df.iterrows():
        ts_val = row["ts"]
        ts = pd.to_datetime(ts_val, utc=True).to_pydatetime().replace(tzinfo=None)
        exists = (
            db.query(HistoricalWeather)
            .filter(HistoricalWeather.loc_key == key, HistoricalWeather.ts == ts)
            .first()
        )
        if exists:
            continue
        rec = HistoricalWeather(
            loc_key=key,
            ts=ts,
            temp_c=None if pd.isna(row["temp_c"]) else float(row["temp_c"]),
            humidity=None if pd.isna(row["humidity"]) else float(row["humidity"]),
            pressure=None if pd.isna(row["pressure"]) else float(row["pressure"]),
            wind_speed=None if pd.isna(row["wind_speed"]) else float(row["wind_speed"]),
            condition=row["condition"] if isinstance(row["condition"], str) else "Unknown",
            source="meteostat",
        )
        db.add(rec)
        inserted += 1

        # Flush every 1000 rows to keep memory reasonable
        if inserted % 1000 == 0:
            db.commit()

    db.commit()
    return inserted
