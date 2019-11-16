import os

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "chyoH3IuefxVDkrSBL0qwfRAiutrOv80FFIq9fDPxyjAR9dxDv5xyIeP8AMy0sS2"
)

SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
SQLALCHEMY_TRACK_MODIFICATIONS = False
