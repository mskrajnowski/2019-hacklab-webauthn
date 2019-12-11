# Hacklab - WebAuthn

A demo project for implementing WebAuthn passwordless authentication.

## Setup

1. Install docker and docker-compose
2. `docker-compose up`

> **Linux permissions**
>
> On Linux you might also want to make containers run as your user, so they don't create files owned by root:
>
> 1. create a `.env` with
>
>     ```
>     export UID=$(id -u)
>     export GID=$(id -g)
>     ```
>
> 2. add `user: "${UID}:${GID}"` to `client` and `server` services in `docker-compose.yml`
> 3. `source .env` before running `docker-compose` in any shell

## References

1. Standards and specifications

    - https://www.w3.org/TR/webauthn/
    - https://fidoalliance.org/specifications/
    - https://tools.ietf.org/html/rfc6238

2. Developer resources

    - https://webauthn.guide/
    - https://developers.yubico.com/U2F/
    - https://developers.yubico.com/WebAuthn/
    - https://fidoalliance.org/developers/resources/
    - https://github.com/herrjemand/awesome-webauthn
    - https://github.com/duo-labs/py_webauthn
    - https://pyotp.readthedocs.io/en/latest/

3. Articles and videos

    - https://www.stackallocated.com/blog/2019/u2f-to-webauthn/
