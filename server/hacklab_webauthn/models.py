from uuid import uuid4

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
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

    @property
    def rolenames(self):
        return []

    def is_valid():
        return True
