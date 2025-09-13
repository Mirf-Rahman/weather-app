from sqlalchemy.orm import Session
from ..db.models import Activity


def ensure_seed_activities(db: Session):
    # If already seeded, skip
    if db.query(Activity).count() > 0:
        return

    seed = [
        Activity(
            key="walking",
            label="Walking",
            tags=["outdoor"],
            temp_min=5, temp_max=30, wind_max=10, humidity_max=90,
            allowed_conditions=["Clear", "Clouds", "Mist"],
        ),
        Activity(
            key="running",
            label="Running",
            tags=["outdoor", "fitness"],
            temp_min=5, temp_max=25, wind_max=8, humidity_max=80,
            allowed_conditions=["Clear", "Clouds"],
        ),
        Activity(
            key="cycling",
            label="Cycling",
            tags=["outdoor", "fitness"],
            temp_min=10, temp_max=28, wind_max=7, humidity_max=80,
            allowed_conditions=["Clear", "Clouds"],
        ),
        Activity(
            key="picnic",
            label="Picnic",
            tags=["outdoor", "leisure"],
            temp_min=15, temp_max=30, wind_max=6, humidity_max=70,
            allowed_conditions=["Clear", "Clouds"],
        ),
        Activity(
            key="photography",
            label="Photography",
            tags=["outdoor", "creative"],
            temp_min=-10, temp_max=35, wind_max=12, humidity_max=100,
            allowed_conditions=["Clear", "Clouds", "Snow", "Mist"],
        ),
        Activity(
            key="museum",
            label="Visit a Museum",
            tags=["indoor", "culture"],
        ),
        Activity(
            key="shopping",
            label="Shopping",
            tags=["indoor"],
        ),
        Activity(
            key="gym",
            label="Gym Workout",
            tags=["indoor", "fitness"],
        ),
        Activity(
            key="cafe",
            label="Reading at a Café",
            tags=["indoor", "leisure"],
        ),
    ]

    db.add_all(seed)
    db.commit()

