from flask import Flask, Blueprint
from flask_praetorian import Praetorian

from .models import User


guard = Praetorian()
bp = Blueprint("api", __name__)


def init_app(app: Flask, url_prefix=""):
    guard.init_app(app, user_class=User)
    app.register_blueprint(bp, url_prefix=url_prefix)


@bp.route("/hello", methods=["get"])
def hello():
    return {"hello": "world"}
