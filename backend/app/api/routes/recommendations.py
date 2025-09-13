from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...db.session import get_db
from ...db.models import Activity
from ...schemas.recommend import (
    ActivityOut,
    RecommendationRequest,
    RecommendationResult,
    FeedbackRequest,
)
from ...services.recommender import recommend, update_preference


router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/activities", response_model=List[ActivityOut])
def list_activities(db: Session = Depends(get_db)):
    acts = db.query(Activity).all()
    return [ActivityOut(key=a.key, label=a.label, tags=a.tags or []) for a in acts]


@router.post("/activities", response_model=List[RecommendationResult])
def recommend_activities(payload: RecommendationRequest, db: Session = Depends(get_db)):
    results = recommend(
        db,
        user_id=payload.user_id,
        units=payload.units,
        temperature=payload.temperature,
        humidity=payload.humidity,
        wind_speed=payload.wind_speed,
        condition=payload.condition,
        top_k=payload.top_k,
    )
    return [
        RecommendationResult(key=k, label=label, score=round(score, 3), reason=reason)
        for (k, label, score, reason) in results
    ]


@router.post("/feedback")
def submit_feedback(payload: FeedbackRequest, db: Session = Depends(get_db)):
    pref = update_preference(db, user_id=payload.user_id, activity_key=payload.activity_key, rating=payload.rating)
    return {"status": "ok", "activity_key": pref.activity_key, "score": pref.score}

