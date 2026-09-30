from fastapi import FastAPI
from app.database import supabase
from app.routers import auth, chat
from app.routers.tasks import router as tasks_router
from app.routers.behavior import router as behavior_router
from app.routers.wellness import router as wellness_router
from app.routers.safety import router as safety_router
from app.routers.lifestyle import router as lifestyle_router
from app.routers.reminders import router as reminders_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Athena API",
    description="API for Athena application",
    version="1.0.0"
)

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(tasks_router)
app.include_router(behavior_router)
app.include_router(wellness_router)
app.include_router(safety_router)
app.include_router(lifestyle_router)
app.include_router(reminders_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Athena API",
    }


@app.get("/health/database")
def database_health():
    try:
        response = supabase.table("health_check").select("*").execute()

        return {
            "status": "healthy",
            "service": "connect",
        }
    except Exception as e:
        return {
            "status": "error",
            "service": "disconnect",
            "error": str(e),
        }
