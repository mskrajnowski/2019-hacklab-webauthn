from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore

def create_app():
    from . import api, models

    app = Flask(__name__)
    app.config.from_object("hacklab_webauthn.config")

    models.init_app(app)
    security = Security(app, SQLAlchemyUserDatastore(models.db, models.User, models.Role))

    app.register_blueprint(api.bp, url_prefix="/api")

    return app
