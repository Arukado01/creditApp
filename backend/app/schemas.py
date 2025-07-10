from marshmallow import Schema, fields, validate, post_load, ValidationError
from decimal import Decimal

# --------------------------------------------------------------------
# Validaciones a nivel de campo
# --------------------------------------------------------------------
NON_EMPTY_STR = validate.Length(min=1, error="No puede estar vacío")


def _as_decimal(value):
    try:
        return Decimal(str(value))
    except Exception as e:
        raise ValidationError("Debe ser numérico") from e


# --------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------
class CreditInSchema(Schema):
    client_name = fields.Str(required=True, validate=NON_EMPTY_STR)
    client_id = fields.Str(required=True, validate=NON_EMPTY_STR)
    amount = fields.Decimal(
        required=True, as_string=True, validate=validate.Range(min=0)
    )
    rate = fields.Float(required=True, validate=validate.Range(min=0))
    term = fields.Integer(required=True, validate=validate.Range(min=1))
    commercial = fields.Str(required=True, validate=NON_EMPTY_STR)

    # Convierte amount a Decimal para el modelo
    @post_load
    def to_decimal(self, data, **_):
        data["amount"] = _as_decimal(data["amount"])
        return data


class CreditOutSchema(Schema):
    id = fields.Int()
    client_name = fields.Str()
    client_id = fields.Str()
    amount = fields.Decimal(as_string=True)
    rate = fields.Float()
    term = fields.Int()
    commercial = fields.Str()
    created_at = fields.DateTime()


class PaginatedSchema(Schema):
    items = fields.List(fields.Nested(CreditOutSchema))
    page = fields.Int()
    per_page = fields.Int()
    total = fields.Int()
    pages = fields.Int()
