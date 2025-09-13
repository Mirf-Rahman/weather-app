from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .db.session import Base, engine, SessionLocal
from .api.routes.health import router as health_router
from .api.routes.auth import router as auth_router
from .api.routes.weather import router as weather_router
from .api.routes.recommendations import router as rec_router
from .api.routes.predictions import router as pred_router


def create_app() -> FastAPI:
    app = FastAPI(title="Aman Skies AI Backend", version="0.1.0")

    # CORS (allow dev frontend; tighten in prod)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ALLOW_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # DB init on startup with simple retry (compose may start DB later)
    import logging, time

    @app.on_event("startup")
    def _init_db():
        for i in range(10):
            try:
                Base.metadata.create_all(bind=engine)
                # Seed activities once
                from .seed.activities import ensure_seed_activities
                db = SessionLocal()
                try:
                    ensure_seed_activities(db)
                finally:
                    db.close()
                return
            except Exception as e:
                logging.warning("DB not ready, retrying... (%s) %s", i + 1, e)
                time.sleep(2)

    # Routers
    app.include_router(health_router, prefix="/api")
    app.include_router(auth_router, prefix="/api")
    app.include_router(weather_router, prefix="/api")
    app.include_router(rec_router, prefix="/api")
    app.include_router(pred_router, prefix="/api")

    return app


app = create_app()
