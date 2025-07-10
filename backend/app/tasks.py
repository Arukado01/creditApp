# backend/app/tasks.py
import os
from celery import Celery
from flask import current_app
from flask_mail import Message

from app import db, mail, create_app
from app.models import Credit, User

# ---------------------------------------------------------------------------
# Configuración Celery
# ---------------------------------------------------------------------------
celery = Celery(
    "tasks",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
)

# Instancia de Flask para usar dentro de las tareas
flask_app = create_app()


class ContextTask(celery.Task):
    """Todas las tareas se ejecutan dentro del app-context de Flask."""

    def __call__(self, *args, **kwargs):
        with flask_app.app_context():
            return super().__call__(*args, **kwargs)


celery.Task = ContextTask


# ---------------------------------------------------------------------------
# Enviar e-mail al crear un crédito
# ---------------------------------------------------------------------------
@celery.task(bind=True, name="send_credit_email")
def send_credit_email(self, credit_id: int) -> str:
    """Envía un correo al usuario que registró el crédito **y** al
    administrador definido en MAIL_ADMIN.
    """
    credit: Credit | None = db.session.get(Credit, credit_id)
    if not credit:
        return "Crédito no encontrado"

    user: User | None = db.session.get(User, credit.user_id)
    if not user:
        return "Usuario no encontrado"

    # ── destinatarios ────────────────────────────────────────────────────
    admin_mail = current_app.config.get("MAIL_ADMIN", "fyasocialcapital@gmail.com")
    recipients = [user.email, admin_mail]

    # ── cuerpo del mensaje ───────────────────────────────────────────────
    body = f"""
    <h3>Crédito #{credit.id} creado</h3>
    <ul>
        <li><strong>Cliente:</strong> {credit.client_name} ({credit.client_id})</li>
        <li><strong>Monto:</strong> {credit.amount:,.2f} COP</li>
        <li><strong>Tasa:</strong> {credit.rate}%</li>
        <li><strong>Plazo:</strong> {credit.term} meses</li>
        <li><strong>Comercial:</strong> {credit.commercial}</li>
        <li><strong>Fecha:</strong> {credit.created_at:%d/%m/%Y %H:%M}</li>
    </ul>
    """

    msg = Message(
        subject=f"Nuevo crédito #{credit.id}",
        recipients=recipients,
        html=body,
    )
    mail.send(msg)
    return "sent"
