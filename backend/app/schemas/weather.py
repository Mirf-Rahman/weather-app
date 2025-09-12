from pydantic import BaseModel, Field
from typing import Optional, Any


class WeatherIngest(BaseModel):
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    weather_condition: Optional[str] = None
    raw_data: Optional[Any] = Field(default=None, description="Raw payload from external API")


class WeatherOut(BaseModel):
    id: int
    location_name: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    temperature: Optional[float]
    humidity: Optional[float]
    pressure: Optional[float]
    weather_condition: Optional[str]

    class Config:
        from_attributes = True

