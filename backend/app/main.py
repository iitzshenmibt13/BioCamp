"""
Camp Ops – FastAPI main entry point.
"""
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth, groups, schedule, points, homework,
    announcements, checkin, photos, incidents, line_webhook,
)
from app.ws.manager import ws_router
from app.services.scheduler import start_scheduler, stop_scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Camp Ops backend...")
    await start_scheduler()
    yield
    # Shutdown
    await stop_scheduler()
    logger.info("Camp Ops backend stopped.")


app = FastAPI(
    title="Camp Ops API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["schedule"])
app.include_router(points.router, prefix="/api/points", tags=["points"])
app.include_router(homework.router, prefix="/api/homework", tags=["homework"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["announcements"])
app.include_router(checkin.router, prefix="/api", tags=["checkin"])
app.include_router(photos.router, prefix="/api/photos", tags=["photos"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["incidents"])
app.include_router(line_webhook.router, prefix="/api/line", tags=["line"])
app.include_router(ws_router, prefix="/api", tags=["websocket"])


@app.get("/health")
async def health():
    return {"status": "ok"}
