import React, {
  createContext,
  FunctionComponent,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react"
import axios from "axios"

import AuthContext from "./AuthContext"
import * as webauthn from "../services/webauthn"

export interface Authenticator {
  id: string
  name: string
  created_at: string
  last_used_at: string | null
}

export interface AuthenticatorsContextValue {
  authenticators: Authenticator[]
  addAuthenticator(): Promise<Authenticator>
  removeAuthenticator(id: string): Promise<void>
}

const AuthenticatorsContext = createContext<AuthenticatorsContextValue>({
  authenticators: [],
  async addAuthenticator() {
    throw new Error("not implemented")
  },
  async removeAuthenticator() {
    throw new Error("not implemented")
  },
})

export default AuthenticatorsContext

export const AuthenticatorsProvider: FunctionComponent = ({ children }) => {
  const { token } = useContext(AuthContext)

  const [authenticators, setAuthenticators] = useState<Authenticator[]>([])

  const addAuthenticator = useCallback(async () => {
    const authenticator = await addAuthenticatorRequest(token)
    setAuthenticators(authenticators => [...authenticators, authenticator])
    return authenticator
  }, [token])

  const removeAuthenticator = useCallback(
    async (id: string) => {
      await removeAuthenticatorRequest(id, token)
      setAuthenticators(authenticators =>
        authenticators.filter(authenticator => authenticator.id !== id)
      )
    },
    [token]
  )

  useEffect(() => {
    if (token) {
      getAuthenticatorsRequest(token).then(setAuthenticators)
    }
  }, [token])

  return (
    <AuthenticatorsContext.Provider
      value={{
        authenticators,
        addAuthenticator,
        removeAuthenticator,
      }}
    >
      {children}
    </AuthenticatorsContext.Provider>
  )
}

function axiosOptions(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

async function getAuthenticatorsRequest(
  token: string
): Promise<Authenticator[]> {
  const { data } = await axios.get<Authenticator[]>(
    "/authenticators",
    axiosOptions(token)
  )

  return data
}

async function removeAuthenticatorRequest(
  id: string,
  token: string
): Promise<void> {
  await axios.delete<void>(`/authenticators/${id}`, axiosOptions(token))
}

async function addAuthenticatorRequest(token: string): Promise<Authenticator> {
  return webauthn.addAuthenticator(token)
}
