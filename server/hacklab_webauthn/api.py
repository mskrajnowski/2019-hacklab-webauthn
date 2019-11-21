from uuid import UUID, uuid4

from flask import current_app as app, request, Flask, Blueprint
from flask_cors import CORS
from flask_praetorian import Praetorian
from flask_praetorian.constants import AccessType
from flask_marshmallow import Marshmallow
from marshmallow import fields, post_load
from sqlalchemy.exc import IntegrityError

from .models import db, User


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


class RegisterSchema(ma.Schema):
    class Meta:
        model = User
        fields = ("email", "name")

    @post_load
    def make_user(self, data, **kwargs):
        return User(id=uuid4(), **data)


@bp.route("/register", methods=["post"])
def register():
    schema = RegisterSchema()
    user = schema.load(request.get_json())

    token = guard.encode_jwt_token(
        user, is_registration_token=True, email=user.email, name=user.name
    )

    return {"token": token}


class RegisterChallengeSchema(ma.Schema):
    token = fields.Str(required=True)


@bp.route("/register/challenge", methods=["post"])
def register_challenge():
    schema = RegisterChallengeSchema()
    data = schema.load(request.get_json())

    token_data = guard.extract_jwt_token(
        data["token"], access_type=AccessType.register
    )

    app.logger.info("token_data: %r", token_data)

    user = User(
        id=UUID(token_data["id"]),
        email=token_data["email"],
        name=token_data["name"],
    )

    db.session.add(user)

    try:
        db.session.commit()
    except IntegrityError:
        return "", 409

    return "", 201
