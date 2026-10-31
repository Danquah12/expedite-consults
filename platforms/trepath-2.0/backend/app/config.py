from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BACKEND_DIR / "trepath.db"
DEFAULT_EVIDENCE_DIR = BACKEND_DIR / "data" / "evidence"

class Settings(BaseSettings):
    app_name: str = "TrePath"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    database_url: str = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"
    jwt_secret: str = "development-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5174,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8008,http://127.0.0.1:8008"
    evidence_dir: str = str(DEFAULT_EVIDENCE_DIR)
    default_scan_timeout_seconds: int = 10

    # OpenVAS / Greenbone GMP Sensor Configuration
    openvas_host: str = "127.0.0.1"
    openvas_port: int = 9390
    openvas_user: str = "admin"
    openvas_password: str = ""
    openvas_enabled: bool = True
    openvas_timeout_seconds: int = 45

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
