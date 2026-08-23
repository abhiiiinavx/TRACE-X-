from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import engine, Base, SessionLocal
from backend.seed.seed_data import seed_database

# Routers
from backend.app.api.auth import router as auth_router
from backend.app.api.emails import router as emails_router
from backend.app.api.analysis import router as analysis_router
from backend.app.api.intel import router as intel_router
from backend.app.api.campaigns import router as campaigns_router
from backend.app.api.graph import router as graph_router
from backend.app.api.cases import router as cases_router
from backend.app.api.reports import router as reports_router
from backend.app.api.copilot import router as copilot_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.demo import router as demo_router

app = FastAPI(
    title="TRACE-X Cyber-Forensics Platform API",
    description="Production-Grade Full-Stack Email Threat Detection, Hop Forensics, Geolocation Attribution & Incident Investigation Platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication & RBAC"])
app.include_router(emails_router, prefix=f"{settings.API_V1_STR}/emails", tags=["Emails"])
app.include_router(analysis_router, prefix=f"{settings.API_V1_STR}/analysis", tags=["Forensic Analysis Pipeline"])
app.include_router(intel_router, prefix=f"{settings.API_V1_STR}/intel", tags=["Threat Intelligence Search"])
app.include_router(campaigns_router, prefix=f"{settings.API_V1_STR}/campaigns", tags=["Campaign DNA & Clustering"])
app.include_router(graph_router, prefix=f"{settings.API_V1_STR}/graph", tags=["Interactive Attack Graph"])
app.include_router(cases_router, prefix=f"{settings.API_V1_STR}/cases", tags=["Forensic Case Management"])
app.include_router(reports_router, prefix=f"{settings.API_V1_STR}/reports", tags=["Forensic Reports"])
app.include_router(copilot_router, prefix=f"{settings.API_V1_STR}/copilot", tags=["AI Investigation Copilot"])
app.include_router(dashboard_router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["SOC Dashboard Stats"])
app.include_router(demo_router, prefix=f"{settings.API_V1_STR}/demo", tags=["Judge & Demo Utilities"])

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Automatically seed default cases if database is freshly created
    db = SessionLocal()
    try:
        from backend.app.db.models import Email
        if db.query(Email).count() == 0:
            print("[INFO] Auto-seeding initial TRACE-X demo dataset...")
            seed_database(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "platform": "TRACE-X Cyber-Forensics Platform",
        "tagline": "Most email security systems stop at detection. TRACE-X continues from detection to investigation.",
        "pipeline": "DETECT -> EXPLAIN -> TRACE -> GEOLOCATE -> CORRELATE -> CLUSTER -> VISUALIZE -> INVESTIGATE -> REPORT",
        "docs": "/docs",
        "status": "operational"
    }
