import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TRACE-X Cyber-Forensics Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tracex_super_secret_forensics_jwt_key_sih2026_production_grade")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./tracex_forensics.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Storage paths
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./storage/eml_vault")
    REPORTS_DIR: str = os.getenv("REPORTS_DIR", "./storage/reports")
    
    # Mock Provider Mode (Guarantee zero paid keys required)
    THREAT_INTEL_MODE: str = os.getenv("THREAT_INTEL_MODE", "MOCK")  # "MOCK" or "HYBRID" or "LIVE"
    
    class Config:
        case_sensitive = True

settings = Settings()

os.makedirs(settings.STORAGE_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
