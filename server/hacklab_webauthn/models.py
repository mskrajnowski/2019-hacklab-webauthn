from uuid import uuid4, UUID

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import sqlalchemy.dialects.postgresql as pg

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

    id = db.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = db.Column(db.String, nullable=False, default="authenticator")

    user_id = db.Column(
        pg.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False
    )
    user = db.relationship("User", backref="authenticators")
