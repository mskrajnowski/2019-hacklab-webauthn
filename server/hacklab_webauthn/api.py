from uuid import UUID, uuid4

from flask import current_app as app, request, Flask, Blueprint
from flask_cors import CORS
from flask_praetorian import Praetorian
from flask_praetorian.constants import AccessType
from flask_marshmallow import Marshmallow
from marshmallow import fields, post_load
from sqlalchemy.exc import IntegrityError
import webauthn
import jwt
import pendulum

from .models import db, User, Authenticator
from .util import generate_challenge


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

    challenge = generate_challenge()
    token = guard.encode_jwt_token(
        user,
        is_registration_token=True,
        email=user.email,
        name=user.name,
        challenge=challenge,
    )

    options = webauthn.WebAuthnMakeCredentialOptions(
        challenge=challenge,
        rp_name=app.config["WEBAUTHN_RP_NAME"],
        rp_id=app.config["WEBAUTHN_RP_ID"],
        user_id=user.id.hex,
        username=user.email,
        display_name=user.name,
        icon_url=app.config["WEBAUTHN_ICON_URL"],
    ).registration_dict

    options["authenticatorSelection"] = {"requireResidentKey": True}

    return {
        "token": token,
        "options": options,
    }


class RegisterChallengeSchema(ma.Schema):
    token = fields.Str(required=True)
    credential = fields.Dict(required=True)


@bp.route("/register/challenge", methods=["post"])
def register_challenge():
    schema = RegisterChallengeSchema()
    data = schema.load(request.get_json())

    try:
        token = guard.extract_jwt_token(
            data["token"], access_type=AccessType.register
        )
    except Exception as exc:
        return {"error": str(exc)}, 401

    response = webauthn.WebAuthnRegistrationResponse(
        rp_id=app.config["WEBAUTHN_RP_ID"],
        origin=app.config["WEBAUTHN_ORIGIN"],
        registration_response=data["credential"],
        challenge=token["challenge"],
    )

    try:
        credential = response.verify()
    except Exception as exc:
        return {"error": str(exc)}, 400

    user = User(
        id=UUID(token["id"]), email=token["email"], name=token["name"],
    )

    authenticator = Authenticator(
        credential_id=str(credential.credential_id, "utf-8"),
        public_key=str(credential.public_key, "utf-8"),
        sign_count=credential.sign_count,
    )

    user.authenticators = [authenticator]
    db.session.add(user)

    try:
        db.session.commit()
    except IntegrityError:
        return "", 409

    return "", 201


@bp.route("/login", methods=["post"])
def login():
    now = pendulum.now("UTC")
    challenge = generate_challenge()
    token = jwt.encode(
        {
            "iat": now.int_timestamp,
            "exp": now.add(minutes=10).int_timestamp,
            "jti": str(uuid4()),
            "challenge": challenge,
        },
        guard.encode_key,
        guard.encode_algorithm,
    ).decode("utf-8")

    return {
        "token": token,
        "options": {
            "challenge": challenge,
            "rpId": app.config["WEBAUTHN_RP_ID"],
            "timeout": 60000,
        },
    }


class LoginChallengeSchema(ma.Schema):
    token = fields.Str(required=True)
    credential = fields.Dict(required=True)


class AuthenticatedUserSchema(ma.Schema):
    class Meta:
        model = User
        fields = ("id", "email", "name")


@bp.route("/login/challenge", methods=["post"])
def login_challenge():
    schema = LoginChallengeSchema()
    data = schema.load(request.get_json())

    try:
        token = jwt.decode(
            data["token"],
            guard.encode_key,
            algorithms=guard.allowed_algorithms,
        )
    except Exception as exc:
        return {"error": str(exc)}, 401

    authenticator = Authenticator.query.filter_by(
        credential_id=data["credential"]["id"]
    ).first()

    if not authenticator:
        return {"error": "Authenticator not found"}, 401

    webauthn_user = webauthn.WebAuthnUser(
        user_id=authenticator.user.id,
        username=authenticator.user.email,
        display_name=authenticator.user.name,
        icon_url=app.config["WEBAUTHN_ICON_URL"],
        credential_id=authenticator.credential_id,
        public_key=authenticator.public_key,
        sign_count=authenticator.sign_count,
        rp_id=app.config["WEBAUTHN_RP_ID"],
    )

    response = webauthn.WebAuthnAssertionResponse(
        webauthn_user=webauthn_user,
        challenge=token["challenge"],
        assertion_response=data["credential"],
        origin=app.config["WEBAUTHN_ORIGIN"],
    )

    try:
        sign_count = response.verify()
    except Exception as exc:
        return {"error": str(exc)}, 400

    authenticator.sign_count = sign_count
    db.session.add(authenticator)
    db.session.commit()

    user_schema = AuthenticatedUserSchema()
    return (
        {
            "token": guard.encode_jwt_token(authenticator.user),
            "user": user_schema.dump(authenticator.user),
        },
        200,
    )

