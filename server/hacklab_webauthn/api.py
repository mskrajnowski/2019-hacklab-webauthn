from uuid import UUID, uuid4
from datetime import datetime, timezone

from flask import current_app as app, request, Flask, Blueprint, jsonify
from flask_cors import CORS
from flask_praetorian import (
    Praetorian,
    auth_required,
    current_user,
    current_user_id,
    current_custom_claims,
)
from flask_marshmallow import Marshmallow
from marshmallow import fields, post_load
from sqlalchemy.exc import IntegrityError
import webauthn

from .models import db, User, Authenticator
from .util import random_string


cors = CORS()
guard = Praetorian()
ma = Marshmallow()
bp = Blueprint("api", __name__)


def init_app(app: Flask, url_prefix=""):
    cors.init_app(app)
    guard.init_app(app, user_class=User)
    ma.init_app(app)
    app.register_blueprint(bp, url_prefix=url_prefix)


class RegisterChallengeSchema(ma.Schema):
    class Meta:
        model = User
        fields = ("email", "name")

    @post_load
    def make_user(self, data, **kwargs):
        return User(id=uuid4(), **data)


@bp.route("/register/challenge", methods=["post"])
def register_challenge():
    schema = RegisterChallengeSchema()
    user = schema.load(request.get_json())
    challenge = random_string()

    token = guard.encode_jwt_token(
        user,
        is_registration=True,
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
        attestation="none",
    ).registration_dict

    return {
        "token": token,
        "options": options,
    }


class RegisterSchema(ma.Schema):
    name = fields.String(default="authenticator")
    id = fields.String(required=True)
    rawId = fields.String(required=True)
    type = fields.String(required=True)
    attObj = fields.String(required=True)
    clientData = fields.String(required=True)
    registrationClientExtensions = fields.String(required=True)


@bp.route("/register", methods=["post"])
@auth_required
def register():
    claims = current_custom_claims()
    if not claims.get("is_registration", False):
        return "", 401

    data = RegisterSchema().load(request.get_json())

    response = webauthn.WebAuthnRegistrationResponse(
        rp_id=app.config["WEBAUTHN_RP_ID"],
        origin=app.config["WEBAUTHN_ORIGIN"],
        registration_response=data,
        challenge=claims["challenge"],
        none_attestation_permitted=True,
    )

    try:
        credential = response.verify()
    except Exception as exc:
        return {"error": str(exc)}, 400

    user = User(
        id=UUID(current_user_id()), email=claims["email"], name=claims["name"],
    )

    authenticator = Authenticator(
        name=data["name"],
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


class LoginChallengeSchema(ma.Schema):
    email = fields.Email(required=True)


@bp.route("/login/challenge", methods=["post"])
def login_challenge():
    data = LoginChallengeSchema().load(request.get_json())
    email = data["email"]

    fake_user = User.generate_fake(email=email)
    user = User.query.filter_by(email=email).first() or fake_user

    challenge = random_string()
    webauthn_users = [
        webauthn.WebAuthnUser(
            user_id=authenticator.user.id,
            username=authenticator.user.email,
            display_name=authenticator.user.name,
            icon_url=app.config["WEBAUTHN_ICON_URL"],
            credential_id=authenticator.credential_id,
            public_key=authenticator.public_key,
            sign_count=authenticator.sign_count,
            rp_id=app.config["WEBAUTHN_RP_ID"],
        )
        for authenticator in user.authenticators
    ]

    options = webauthn.WebAuthnAssertionOptions(
        webauthn_users, challenge
    ).assertion_dict

    token = guard.encode_jwt_token(
        user, is_login=True, email=email, challenge=challenge
    )

    return {
        "token": token,
        "options": options,
    }


class LoginSchema(ma.Schema):
    id = fields.String(required=True)
    rawId = fields.String(required=True)
    type = fields.String(required=True)
    authData = fields.String(required=True)
    clientData = fields.String(required=True)
    assertionClientExtensions = fields.String(required=True)
    signature = fields.String(required=True)


class UserSchema(ma.Schema):
    class Meta:
        model = User
        fields = ("id", "email", "name")


@bp.route("/login", methods=["post"])
@auth_required
def login():
    claims = current_custom_claims()
    if not claims.get("is_login", False):
        return "", 401

    data = LoginSchema().load(request.get_json())

    email = claims["email"]
    credential_id = data["id"]

    authenticator = Authenticator.query.filter(
        Authenticator.credential_id == credential_id,
        Authenticator.user.has(email=email),
    ).first()

    if not authenticator:
        return {"error": "authenticator not found"}, 401

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
        challenge=claims["challenge"],
        assertion_response=data,
        origin=app.config["WEBAUTHN_ORIGIN"],
    )

    try:
        sign_count = response.verify()
    except Exception as exc:
        return {"error": str(exc)}, 401

    authenticator.sign_count = sign_count
    authenticator.last_used_at = datetime.now(timezone.utc)
    db.session.add(authenticator)
    db.session.commit()

    return (
        {
            "token": guard.encode_jwt_token(authenticator.user),
            "user": UserSchema().dump(authenticator.user),
            "authenticator": AuthenticatorSchema().dump(authenticator),
        },
        200,
    )


class AuthenticatorSchema(ma.ModelSchema):
    class Meta:
        model = Authenticator
        fields = ("id", "name", "created_at", "last_used_at")


@bp.route("/authenticators", methods=["get"])
@auth_required
def list_authenticators():
    schema = AuthenticatorSchema()
    authenticators = Authenticator.query.filter(
        Authenticator.user_id == UUID(current_user_id())
    ).order_by(Authenticator.created_at)
    return jsonify(schema.dump(authenticators, many=True)), 200


@bp.route("/authenticators/challenge", methods=["post"])
@auth_required
def add_authenticator_challenge():
    user = current_user()
    challenge = random_string()

    token = guard.encode_jwt_token(
        user, is_add_authenticator=True, challenge=challenge,
    )

    options = webauthn.WebAuthnMakeCredentialOptions(
        challenge=challenge,
        rp_name=app.config["WEBAUTHN_RP_NAME"],
        rp_id=app.config["WEBAUTHN_RP_ID"],
        user_id=user.id.hex,
        username=user.email,
        display_name=user.name,
        icon_url=app.config["WEBAUTHN_ICON_URL"],
        attestation="none",
    ).registration_dict

    return {
        "token": token,
        "options": options,
    }


@bp.route("/authenticators", methods=["post"])
@auth_required
def add_authenticator():
    claims = current_custom_claims()
    if not claims.get("is_add_authenticator", False):
        return "", 401

    data = RegisterSchema().load(request.get_json())
    user = current_user()

    response = webauthn.WebAuthnRegistrationResponse(
        rp_id=app.config["WEBAUTHN_RP_ID"],
        origin=app.config["WEBAUTHN_ORIGIN"],
        registration_response=data,
        challenge=claims["challenge"],
        none_attestation_permitted=True,
    )

    try:
        credential = response.verify()
    except Exception as exc:
        return {"error": str(exc)}, 400

    authenticator = Authenticator(
        name=data["name"],
        credential_id=str(credential.credential_id, "utf-8"),
        public_key=str(credential.public_key, "utf-8"),
        sign_count=credential.sign_count,
    )

    user.authenticators.append(authenticator)
    db.session.add(user)

    try:
        db.session.commit()
    except IntegrityError:
        return "", 409

    return AuthenticatorSchema().dump(authenticator), 201


@bp.route("/authenticators/<id>", methods=["delete"])
@auth_required
def delete_authenticator(id):
    authenticator = Authenticator.query.filter_by(
        id=id, user_id=current_user_id()
    ).first_or_404()

    db.session.delete(authenticator)
    db.session.commit()
    return "", 204
