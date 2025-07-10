from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()
mail = Mail()


def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    CORS(
        app,
        resources={
            r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}
        },
        supports_credentials=True,
    )

    print(">> MAIL_SERVER:", app.config["MAIL_SERVER"])
    print(">> MAIL_USE_TLS:", app.config["MAIL_USE_TLS"])

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    from . import models

    from .routes.auth import auth_bp
    from .routes.credits import credits_bp

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(credits_bp, url_prefix="/api/v1/credits")

    return app
