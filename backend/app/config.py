import os
from pathlib import Path
from dotenv import load_dotenv

# -------------------------------------------------------------------
# Cargar variables de entorno desde backend/.env
# -------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _bool(name: str, default: str = "False") -> bool:
    return os.getenv(name, default).lower() in {"true", "1", "yes"}


# -------------------------------------------------------------------
# Configuración principal de Flask
# -------------------------------------------------------------------
class Config:
    # Base de datos
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URI",
        "postgresql://credits_user:supersegura@localhost:5432/credits_db",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Seguridad
    SECRET_KEY = os.getenv("SECRET_KEY", "SÚPER_SECRETA")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "SÚPER_JWT")

    # Correo (SendGrid)
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.sendgrid.net")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS = _bool("MAIL_USE_TLS", "True")  # ← ahora funciona
    MAIL_USE_SSL = _bool("MAIL_USE_SSL", "False")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "apikey")  # apikey fijo
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
    MAIL_DEFAULT_SENDER = os.getenv(
        "MAIL_DEFAULT_SENDER", "notificaciones@tusistema.com"
    )
    MAIL_ADMIN = os.getenv("MAIL_ADMIN", "fyasocialcapital@gmail.com")
    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND = os.getenv(
        "CELERY_RESULT_BACKEND", "redis://localhost:6379/0"
    )
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
