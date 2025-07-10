"""
Blueprint de autenticación
──────────────────────────
- POST /register          → crea usuario y devuelve JWT
- POST /login             → devuelve JWT
- POST /forgot            → envía enlace de reseteo
- POST /reset/<token>     → cambia la contraseña
- GET  /profile           → ejemplo de ruta protegida
"""

from __future__ import annotations

import re
from typing import Any, Dict

from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from app import db, mail
from app.models import User

auth_bp = Blueprint("auth", __name__)

# ────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────


def _json() -> Dict[str, Any]:
    """Devuelve el JSON de la petición o {} si está vacío."""
    return request.get_json(silent=True) or {}


def _serializer() -> URLSafeTimedSerializer:
    """
    Instancia el serializer para tokens de reseteo.

    Se crea on-demand porque `current_app` sólo existe dentro
    del contexto de petición.
    """
    return URLSafeTimedSerializer(
        secret_key=current_app.config["SECRET_KEY"],
        salt="password-reset",
    )


EMAIL_RE = re.compile(r"^\S+@\S+\.\S+$")

# ────────────────────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────────────────────


@auth_bp.post("/register")
def register():
    data = _json()
    email: str = data.get("email", "").strip().lower()
    password: str = data.get("password", "").strip()

    if not EMAIL_RE.match(email):
        return jsonify({"msg": "Email inválido"}), 400
    if len(password) < 6:
        return jsonify({"msg": "La contraseña debe tener al menos 6 caracteres"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El usuario ya existe"}), 409

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token}), 201


@auth_bp.post("/login")
def login():
    data = _json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Credenciales incorrectas"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token}), 200


@auth_bp.post("/forgot")
def forgot_password():
    """Envía enlace de restablecimiento al FrontEnd."""
    data = _json()
    email = data.get("email", "").strip().lower()
    user = User.query.filter_by(email=email).first()

    if not user:
        return {"msg": "Email no registrado"}, 404

    token = _serializer().dumps(user.email)
    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
    reset_link = f"{frontend_url}/reset/{token}"

    try:
        msg = Message(
            subject="Restablecer contraseña",
            recipients=[user.email],
            body=f"""Para restablecer tu contraseña haz clic en el enlace:

{reset_link}

Este enlace expira en 10 minutos.""",
        )
        mail.send(msg)
    except Exception:
        current_app.logger.exception("Error enviando correo de reseteo")
        return {"msg": "No se pudo enviar el email"}, 500

    return {"msg": "Correo enviado"}, 200


@auth_bp.post("/reset/<token>")
def reset_password(token):
    data = _json()
    new_pwd = data.get("password", "").strip()

    if len(new_pwd) < 6:
        return jsonify({"msg": "La contraseña debe tener al menos 6 caracteres"}), 400

    try:
        email = _serializer().loads(token, max_age=600)  # 10 min
    except SignatureExpired:
        return jsonify({"msg": "El enlace ha expirado"}), 400
    except BadSignature:
        return jsonify({"msg": "Token inválido"}), 400

    user = User.query.filter_by(email=email).first_or_404()
    user.set_password(new_pwd)
    db.session.commit()
    return jsonify({"msg": "Contraseña actualizada"}), 200


# ────────────────────────────────────────────────────────────────
# Consultar usuario autenticado
# ────────────────────────────────────────────────────────────────


@auth_bp.get("/profile")
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({"id": user.id, "email": user.email}), 200
