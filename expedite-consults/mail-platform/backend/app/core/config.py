from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AxiomMail Core Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Security
    ENVIRONMENT: str = "development"
    JWT_SECRET: str = "supersecret_axiom_jwt_key_2026_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (PostgreSQL)
    DATABASE_URL: str = "postgresql+asyncpg://mailuser:StrongSecureDBPassword_123@localhost:5432/mailserver"
    
    # Redis Cache & Queue
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # MinIO / S3 Object Storage
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadminpassword123"
    S3_BUCKET: str = "axiom-attachments"
    S3_SECURE: bool = False
    
    # Outbound SMTP Mail Relay
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025  # Mailpit default (change to 587/465 in production)
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = False
    
    # LLM / AI Configuration
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
