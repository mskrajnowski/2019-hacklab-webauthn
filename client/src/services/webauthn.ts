import axios from "axios"

import * as base64 from "base64-arraybuffer"

export async function register(email: string, name: string) {
  const {
    data: { token, options },
  } = await axios.post<RegisterData>("/register", {
    email,
    name,
  })

  const credential = (await navigator.credentials.create({
    publicKey: encodeCreateOptions(options),
  })) as PublicKeyCredential

  await axios.post("/register/challenge", {
    token,
    credential: serializeCreatedCredential(credential),
  })
}

export async function login(email: string) {
  const {
    data: { token: challengeToken, options },
  } = await axios.post<LoginData>("/login", { email })

  const credential = (await navigator.credentials.get({
    publicKey: encodeRequestOptions(options),
  })) as PublicKeyCredential

  const {
    data: { token, user },
  } = await axios.post("/login/challenge", {
    token: challengeToken,
    credential: serializeRequestedCredential(credential),
  })

  return { token, user }
}

interface RegisterData {
  token: string
  options: ServerPublicKeyCredentialCreationOptions
}

interface LoginData {
  token: string
  options: ServerPublicKeyCredentialRequestOptions
}

interface ServerPublicKeyCredentialCreationOptions
  extends Omit<PublicKeyCredentialCreationOptions, "challenge" | "user"> {
  challenge: string
  user: Omit<PublicKeyCredentialUserEntity, "id"> & {
    id: string
  }
}

interface ServerPublicKeyCredentialRequestOptions
  extends Omit<
    PublicKeyCredentialRequestOptions,
    "challenge" | "allowCredentials"
  > {
  challenge: string
  allowCredentials?: Array<
    Omit<PublicKeyCredentialDescriptor, "id"> & {
      id: string
    }
  >
}

function encodeCreateOptions(
  options: ServerPublicKeyCredentialCreationOptions
): PublicKeyCredentialCreationOptions {
  const {
    challenge,
    user: { id },
  } = options

  return {
    ...options,
    challenge: base64.decode(challenge),
    user: { ...options.user, id: base64.decode(id) },
  }
}

function encodeRequestOptions(
  options: ServerPublicKeyCredentialRequestOptions
): PublicKeyCredentialRequestOptions {
  const { challenge, allowCredentials } = options

  return {
    ...options,
    challenge: base64.decode(challenge),
    allowCredentials:
      allowCredentials &&
      allowCredentials.map(credential => ({
        ...credential,
        id: base64.decode(credential.id.replace(/_/g, "/").replace(/-/g, "+")),
      })),
  }
}

function serializeCreatedCredential(credential: PublicKeyCredential) {
  const { id, rawId, type } = credential
  const {
    attestationObject,
    clientDataJSON,
  } = credential.response as AuthenticatorAttestationResponse
  const clientExtensions = credential.getClientExtensionResults()

  return {
    id,
    rawId: base64.encode(rawId),
    type,
    attObj: base64.encode(attestationObject),
    clientData: base64.encode(clientDataJSON),
    registrationClientExtensions: JSON.stringify(clientExtensions),
  }
}

function serializeRequestedCredential(credential: PublicKeyCredential) {
  const { id, rawId, type } = credential
  const {
    authenticatorData,
    signature,
    clientDataJSON,
  } = credential.response as AuthenticatorAssertionResponse
  const clientExtensions = credential.getClientExtensionResults()

  return {
    id,
    rawId: base64.encode(rawId),
    type,
    authData: base64.encode(authenticatorData),
    clientData: base64.encode(clientDataJSON),
    assertionClientExtensions: JSON.stringify(clientExtensions),
    signature: hexEncode(signature),
  }
}

function hexEncode(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map(x => ("0" + x.toString(16)).substr(-2))
    .join("")
}
