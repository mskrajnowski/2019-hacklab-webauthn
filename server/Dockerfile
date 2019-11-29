FROM python:3.7.5-alpine

WORKDIR /opt/hacklab

RUN pip install pipenv==2018.11.26

RUN apk add --no-cache \
  gcc \
  musl-dev \
  libffi-dev \
  postgresql-dev \
  openssl-dev \
  git

COPY ./Pipfile ./Pipfile.lock ./
ENV PIPENV_VENV_IN_PROJECT=true
RUN pipenv install --dev --deploy

COPY ./hacklab_webauthn ./hacklab_webauthn
COPY ./migrations ./migrations

ENV PATH="/opt/hacklab/.venv/bin:${PATH}"
ENV FLASK_ENV=production
EXPOSE 8080

ENTRYPOINT [ ]
CMD [ "waitress-serve", "--call", "hacklab_webauthn.app:create_app" ]
