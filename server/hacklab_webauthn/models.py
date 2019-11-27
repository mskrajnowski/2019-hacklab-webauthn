from uuid import uuid4, UUID

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.sql.schema import UniqueConstraint
from sqlalchemy.sql import functions


db = SQLAlchemy()
migrate = Migrate(db=db)


def init_app(app: Flask):
    db.init_app(app)
    migrate.init_app(app)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = db.Column(db.String, unique=True, nullable=False)
    name = db.Column(db.String, nullable=False)

    created_at = db.Column(
        db.TIMESTAMP(timezone=True),
        nullable=False,
        server_default=functions.current_timestamp(),
    )

    @classmethod
    def generate_fake(cls, email):
        user = cls(id=uuid4(), email=email, name="John Doe")
        user.authenticators = [Authenticator.generate_fake()]
        return user

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(email=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(UUID(id))

    @property
    def identity(self):
        return self.id.hex

    @property
    def rolenames(self):
        return []

    def is_valid(self):
        return True


class Authenticator(db.Model):
    __tablename__ = "authenticators"
    __table_args__ = (UniqueConstraint("credential_id", "user_id"),)

    id = db.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = db.Column(db.String, nullable=False, default="authenticator")
    credential_id = db.Column(db.String, nullable=False)
    public_key = db.Column(db.String, nullable=False)
    sign_count = db.Column(db.Integer, nullable=False)

    created_at = db.Column(
        db.TIMESTAMP(timezone=True),
        nullable=False,
        server_default=functions.current_timestamp(),
    )
    last_used_at = db.Column(db.TIMESTAMP(timezone=True))

    user_id = db.Column(
        pg.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False
    )
    user = db.relationship("User", backref="authenticators")

    @classmethod
    def generate_fake(cls):
        return cls(
            id=uuid4(),
            name="authenticator",
            credential_id="7SI3X75x6wFGxMS1TAHQEFRtifLfD9Gi",
            public_key="iOy7iL2iTKhQ3t4fFHrG3zwSivyaDYIS",
            sign_count=11,
        )
