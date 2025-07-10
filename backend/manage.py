from flask.cli import FlaskGroup
from app import create_app, db

app = create_app()
cli = FlaskGroup(create_app=create_app)


@cli.command("create_db")
def create_db():
    db.create_all()
    print("Base de datos creada.")


if __name__ == "__main__":
    cli()
