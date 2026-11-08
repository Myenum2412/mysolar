from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, loaded from environment variables / .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "MySolar API"
    debug: bool = True

    database_url: str = "postgresql+psycopg://mysolar:mysolar@127.0.0.1:5432/mysolar"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    frontend_url: str = "http://localhost:3000"

    google_client_id: str = ""
    google_client_secret: str = ""

    # Comma separated list of emails that should always be admins.
    admin_emails: str = ""

    reset_token_expire_minutes: int = 30
    # In development the API returns the reset link so the flow can be tested
    # without an SMTP server. Disable in production.
    expose_reset_link: bool = True

    @property
    def admin_email_set(self) -> set[str]:
        return {
            email.strip().lower()
            for email in self.admin_emails.split(",")
            if email.strip()
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
