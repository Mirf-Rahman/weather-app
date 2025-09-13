from pydantic import BaseModel
from typing import List, Optional


class ActivityOut(BaseModel):
    key: str
    label: str
    tags: List[str] = []


class RecommendationRequest(BaseModel):
    user_id: Optional[int] = None
    units: str = "metric"  # "metric" | "imperial"
    temperature: float
    humidity: float
    wind_speed: float
    condition: str  # e.g. Clear, Clouds, Rain, Thunderstorm, Snow, Mist
    top_k: int = 5


class RecommendationResult(BaseModel):
    key: str
    label: str
    score: float
    reason: str


class FeedbackRequest(BaseModel):
    user_id: int
    activity_key: str
    rating: int  # 1..5

