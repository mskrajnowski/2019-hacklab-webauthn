from flask import Blueprint

bp = Blueprint("api", __name__)


@bp.route("/hello", methods=["get"])
def hello():
    return {"hello": "world"}
