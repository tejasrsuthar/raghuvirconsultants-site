from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "Raghuvir Consultants API"
    VERSION: str = "2.12.29"
    ALLOWED_ORIGINS: str = ""
    
    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "raghuvir_consultants"
    
    # Security
    JWT_SECRET_KEY: str = "supersecretkey" # Override in production
    
    # External Services
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder"
    RAZORPAY_KEY_SECRET: str = "placeholder_secret"
    RAZORPAY_WEBHOOK_SECRET: str = "webhook_secret_placeholder"
    
    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    
    # Stripe is being replaced by Razorpay but keep it while we migrate
    STRIPE_API_KEY: str = "sk_test_mockkey"
    STRIPE_WEBHOOK_SECRET: str = "whsec_mock"
    
    # Observability
    SENTRY_DSN: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        default_origins = [
            "https://www.raghuvirconsultants.in",
            "https://raghuvirconsultants.in",
            "https://admin.raghuvirconsultants.in",
            "http://raghuvircons.local",
            "http://app.raghuvircons.local",
            "http://localhost",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://127.0.0.1",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ]
        custom = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        return list(dict.fromkeys(default_origins + custom))

settings = Settings()
