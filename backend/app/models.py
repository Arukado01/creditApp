from datetime import datetime
from app import db, bcrypt


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, plaintext: str) -> None:
        self.password_hash = bcrypt.generate_password_hash(plaintext).decode()

    def check_password(self, plaintext: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, plaintext)


class Credit(db.Model):
    __tablename__ = "credits"

    id = db.Column(db.Integer, primary_key=True)
    client_name = db.Column(db.String(120), nullable=False)
    client_id = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    rate = db.Column(db.Float, nullable=False)
    term = db.Column(db.Integer, nullable=False)
    commercial = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", backref="credits")
