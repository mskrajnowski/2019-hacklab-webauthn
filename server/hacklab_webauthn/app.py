from flask import Flask


def create_app():
    from . import api, models

    app = Flask(__name__)
    app.config.from_object("hacklab_webauthn.config")

    models.init_app(app)
    api.init_app(app, url_prefix="/api")

    return app
