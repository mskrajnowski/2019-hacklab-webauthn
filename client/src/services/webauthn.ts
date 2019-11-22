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
    credential: serializeCredential(credential),
  })
}

interface RegisterData {
  token: string
  options: ServerPublicKeyCredentialCreationOptions
}

interface ServerPublicKeyCredentialCreationOptions
  extends Omit<PublicKeyCredentialCreationOptions, "challenge" | "user"> {
  challenge: string
  user: Omit<PublicKeyCredentialUserEntity, "id"> & {
    id: string
  }
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

function serializeCredential(credential: PublicKeyCredential) {
  const { id, rawId, type } = credential
  const {
    attestationObject,
    clientDataJSON,
  } = credential.response as AuthenticatorAttestationResponse
  const clientExtensions = credential.getClientExtensionResults()

  console.log({
    id,
    rawId,
    type,
    attestationObject,
    clientDataJSON: JSON.parse(new TextDecoder().decode(clientDataJSON)),
    clientExtensions,
  })

  return {
    id,
    rawId: base64.encode(rawId),
    type,
    attObj: base64.encode(attestationObject),
    clientData: base64.encode(clientDataJSON),
    registrationClientExtensions: JSON.stringify(clientExtensions),
  }
}
