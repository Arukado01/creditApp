# backend/app/routes/credits.py
from decimal import Decimal
from typing import Dict, Any

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
from app.models import Credit
from app.schemas import CreditInSchema, CreditOutSchema, PaginatedSchema

credits_bp = Blueprint("credits", __name__)

credit_in = CreditInSchema()
credit_out = CreditOutSchema()
paginate_out = PaginatedSchema()


def _json() -> Dict[str, Any]:
    """Devuelve el JSON del request o {}."""
    return request.get_json(silent=True) or {}


# ────────────────────────────────────────────────────────────────
# Crear crédito
# ────────────────────────────────────────────────────────────────
@credits_bp.post("/")
@jwt_required()
def create_credit():
    try:
        data = credit_in.load(_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    credit = Credit(**data, user_id=int(get_jwt_identity()))
    db.session.add(credit)
    db.session.commit()

    # correo asíncrono
    from app.tasks import send_credit_email

    send_credit_email.apply_async(args=[credit.id], task_id=f"email-{credit.id}")

    return jsonify(credit_out.dump(credit)), 201


# ────────────────────────────────────────────────────────────────
# Listar créditos
# ────────────────────────────────────────────────────────────────
@credits_bp.get("/")
@jwt_required()
def list_credits():
    query = Credit.query

    # filtros opcionales
    if cid := request.args.get("client_id"):
        query = query.filter_by(client_id=cid)
    if comm := request.args.get("commercial"):
        query = query.filter(Credit.commercial.ilike(f"%{comm}%"))

    # paginación
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    pagination = query.order_by(Credit.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    result = {
        "items": pagination.items,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    }
    return jsonify(paginate_out.dump(result)), 200


# ────────────────────────────────────────────────────────────────
# Obtener un crédito
# ────────────────────────────────────────────────────────────────
@credits_bp.get("/<int:credit_id>")
@jwt_required()
def get_credit(credit_id):
    credit = Credit.query.get_or_404(credit_id)
    return jsonify(credit_out.dump(credit)), 200


# ────────────────────────────────────────────────────────────────
# Actualizar un crédito
# ────────────────────────────────────────────────────────────────
@credits_bp.put("/<int:credit_id>")
@jwt_required()
def update_credit(credit_id):
    credit = Credit.query.get_or_404(credit_id)

    try:
        data = credit_in.load(_json(), partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 422

    for key, value in data.items():
        if key == "amount":
            setattr(credit, key, Decimal(str(value)))
        else:
            setattr(credit, key, value)

    db.session.commit()
    return jsonify(credit_out.dump(credit)), 200


# ────────────────────────────────────────────────────────────────
# Eliminar un crédito
# ────────────────────────────────────────────────────────────────
@credits_bp.delete("/<int:credit_id>")
@jwt_required()
def delete_credit(credit_id):
    credit = Credit.query.get_or_404(credit_id)
    db.session.delete(credit)
    db.session.commit()
    return "", 204


# ────────────────────────────────────────────────────────────────
# Valores para filtros
# ────────────────────────────────────────────────────────────────
@credits_bp.get("/distinct")
def distinct_fields():
    cols = {
        "client_name": Credit.client_name,
        "client_id": Credit.client_id,
        "commercial": Credit.commercial,
    }

    data = {}
    for key, column in cols.items():
        rows = db.session.query(column).distinct().order_by(column).all()
        data[key] = [r[0] for r in rows if r[0]]

    return jsonify(data), 200
