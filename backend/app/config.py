from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://campops:campops_secret@localhost:5432/campops"

    # JWT
    jwt_secret: str = "change_this_secret"
    jwt_expire_hours: int = 168  # 7 days

    # LINE
    line_channel_secret: str = ""
    line_channel_access_token: str = ""
    line_login_channel_id: str = ""

    # S3 / MinIO
    s3_endpoint: str = "http://localhost:9000"
    s3_bucket: str = "campops"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin_secret"
    s3_public_base_url: str = "http://localhost:9000/campops"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Timezone
    tz: str = "Asia/Taipei"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
