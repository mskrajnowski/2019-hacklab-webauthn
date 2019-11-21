from flask import Flask, Blueprint
from flask_cors import CORS
from flask_praetorian import Praetorian
from flask_marshmallow import Marshmallow, fields

from .models import User


cors = CORS()
guard = Praetorian()
ma = Marshmallow()
bp = Blueprint("api", __name__)


def init_app(app: Flask, url_prefix=""):
    cors.init_app(app)
    guard.init_app(app, user_class=User)
    ma.init_app(app)
    app.register_blueprint(bp, url_prefix=url_prefix)


@bp.route("/hello", methods=["get"])
def hello():
    return {"hello": "world"}
