from __future__ import annotations

from typing import List, Tuple
from sqlalchemy.orm import Session

from ..db.models import Activity, UserPreference


def _to_metric_wind(speed: float, units: str) -> float:
    # input may be mph if imperial; convert to m/s
    if units == "imperial":
        return speed * 0.44704
    return speed


def _to_metric_temp(temp: float, units: str) -> float:
    # input may be Fahrenheit; convert to Celsius
    if units == "imperial":
        return (temp - 32) * (5.0 / 9.0)
    return temp


def score_activity(
    activity: Activity,
    *,
    temp_c: float,
    humidity: float,
    wind_ms: float,
    condition: str,
) -> Tuple[float, str]:
    condition_l = condition.lower()
    score = 0.0
    pos_reasons: List[str] = []
    neg_reasons: List[str] = []

    # Base score by tags (reduce baseline so weather matters more)
    tags = [t.lower() for t in (activity.tags or [])]
    if "indoor" in tags:
        score += 0.1
    if "outdoor" in tags:
        score += 0.2

    # Condition matching
    allowed = [c.lower() for c in (activity.allowed_conditions or [])]
    good_condition = False
    if allowed:
        if condition_l in allowed:
            good_condition = True
            score += 0.7
        else:
            score -= 0.5
            neg_reasons.append("conditions not ideal")
    else:
        # Penalize severe conditions if no explicit allowlist
        if condition_l in {"thunderstorm"}:
            score -= 0.9
            neg_reasons.append("thunderstorms — avoid")
        elif condition_l in {"rain", "drizzle", "snow"}:
            if "outdoor" in tags:
                score -= 0.5
                neg_reasons.append("precipitation")
            if "indoor" in tags:
                score += 0.4  # indoor boost when precip
                pos_reasons.append("better as an indoor plan today")
        else:
            good_condition = True

    # Temperature fit (stronger separation)
    temp_ok = True
    if activity.temp_min is not None and temp_c < activity.temp_min:
        score -= 0.7
        temp_ok = False
        neg_reasons.append("too cold")
    if activity.temp_max is not None and temp_c > activity.temp_max:
        score -= 0.7
        temp_ok = False
        neg_reasons.append("too hot")
    if temp_ok:
        score += 0.3

    # Wind fit
    wind_ok = True
    if activity.wind_max is not None and wind_ms > activity.wind_max:
        score -= 0.4
        wind_ok = False
        neg_reasons.append("too windy")
    else:
        # small reward if comfortably under the cap
        score += 0.15

    # Humidity fit
    humidity_ok = True
    if activity.humidity_max is not None and humidity > activity.humidity_max:
        score -= 0.25
        humidity_ok = False
        neg_reasons.append("humidity high")
    else:
        # mild reward if generally comfortable
        if humidity <= 70:
            score += 0.1

    # Compose reason: only say "ideal conditions" when all checks are good
    if good_condition and temp_ok and wind_ok and humidity_ok:
        pos_reasons.insert(0, "ideal conditions")

    # Order: negatives first, then positives, unique
    def _dedup(xs: List[str]) -> List[str]:
        seen = set()
        out = []
        for x in xs:
            if x and x not in seen:
                seen.add(x)
                out.append(x)
        return out

    reasons = _dedup(neg_reasons) + _dedup(pos_reasons)
    return score, "; ".join(reasons) if reasons else "good match"


def recommend(
    db: Session,
    *,
    user_id: int | None,
    units: str,
    temperature: float,
    humidity: float,
    wind_speed: float,
    condition: str,
    top_k: int = 5,
):
    # Convert to metric for uniform comparisons
    temp_c = _to_metric_temp(temperature, units)
    wind_ms = _to_metric_wind(wind_speed, units)

    activities = db.query(Activity).all()

    # User preference map
    user_scores: dict[str, float] = {}
    if user_id is not None:
        prefs = (
            db.query(UserPreference)
            .filter(UserPreference.user_id == user_id)
            .all()
        )
        user_scores = {p.activity_key: p.score for p in prefs}

    results = []
    for a in activities:
        w_score, reason = score_activity(
            a,
            temp_c=temp_c,
            humidity=humidity,
            wind_ms=wind_ms,
            condition=condition,
        )
        u_score = user_scores.get(a.key, 0.0)
        final = 0.7 * w_score + 0.3 * u_score
        results.append((a.key, a.label, final, reason))

    results.sort(key=lambda x: x[2], reverse=True)
    return results[: max(1, top_k)]


def update_preference(db: Session, *, user_id: int, activity_key: str, rating: int):
    # rating 1..5 => map to [-1, 1]
    r = max(1, min(5, rating))
    mapped = (r - 3) / 2  # 1->-1, 3->0, 5->1
    pref = (
        db.query(UserPreference)
        .filter(
            UserPreference.user_id == user_id,
            UserPreference.activity_key == activity_key,
        )
        .first()
    )
    if pref:
        # EMA update
        pref.score = 0.7 * pref.score + 0.3 * mapped
    else:
        pref = UserPreference(user_id=user_id, activity_key=activity_key, score=mapped)
        db.add(pref)
    db.commit()
    return pref
