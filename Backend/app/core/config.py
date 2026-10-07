from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    app_name: str
    supabase_url: str
    supabase_publishable_key: str
    supabase_jwks_url: str
    gemini_api_key: str
    cors_origins: str
    max_request_body_bytes: int = 16_384
    max_transcript_chars: int = 100_000
    generation_requests_per_user_per_minute: int = 5
    generation_requests_per_ip_per_minute: int = 20

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
