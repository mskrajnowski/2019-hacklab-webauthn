import { notification } from "antd"
import React, {
  createContext,
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from "react"

import { login } from "../services/webauthn"
import { delay } from "../utils"
import { Authenticator } from "./AuthenticatorsContext"

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthContextValue {
  readonly lastEmail: string
  readonly token: string
  readonly user: User | null
  readonly authenticator: Authenticator | null
  readonly isLoggedIn: boolean
  readonly isLoggingIn: boolean
  readonly isLoggingOut: boolean
  logIn(email: string): Promise<void>
  logOut(): Promise<void>
  setLastEmail(email: string): void
}

const AuthContext = createContext<AuthContextValue>({
  lastEmail: "",
  token: "",
  user: null,
  authenticator: null,
  isLoggedIn: false,
  isLoggingIn: false,
  isLoggingOut: false,
  async logIn(email: string) {},
  async logOut() {},
  setLastEmail(email: string) {},
})

export default AuthContext

export const AuthProvider: FunctionComponent = ({ children }) => {
  const [lastEmail, setLastEmail] = useState(
    localStorage.getItem("auth.lastEmail") || ""
  )
  const [token, setToken] = useState(localStorage.getItem("auth.token") || "")
  const [user, setUser] = useState<User | null>(() => {
    const userJson = localStorage.getItem("auth.user")
    return userJson ? JSON.parse(userJson) : null
  })
  const [authenticator, setAuthenticator] = useState<Authenticator | null>(
    () => {
      const authenticatorJson = localStorage.getItem("auth.authenticator")
      return authenticatorJson ? JSON.parse(authenticatorJson) : null
    }
  )
  const [isLoggingIn, setLoggingIn] = useState(false)
  const [isLoggingOut, setLoggingOut] = useState(false)
  const isLoggedIn = !!user

  useEffect(() => {
    if (token && user) {
      localStorage.setItem("auth.token", token)
      localStorage.setItem("auth.user", JSON.stringify(user))
      localStorage.setItem("auth.authenticator", JSON.stringify(authenticator))
    } else {
      localStorage.removeItem("auth.token")
      localStorage.removeItem("auth.user")
      localStorage.removeItem("auth.authenticator")
    }
  }, [token, user, authenticator])

  useEffect(() => {
    if (lastEmail) {
      localStorage.setItem("auth.lastEmail", lastEmail)
    } else {
      localStorage.removeItem("auth.lastEmail")
    }
  }, [lastEmail])

  const logIn = useCallback(async (email: string) => {
    setLoggingIn(true)

    try {
      const { token, user, authenticator } = await login(email)

      setToken(token)
      setUser(user)
      setAuthenticator(authenticator)
      setLastEmail(user.email)
      notification.success({
        message: `Hello ${user.name}!`,
        description: "You've successfully logged in",
      })
    } catch (err) {
      notification.error({
        message: "Failed to log in",
        description: err.toString(),
      })
    } finally {
      setLoggingIn(false)
    }
  }, [])

  const logOut = useCallback(async () => {
    setLoggingOut(true)
    try {
      await delay(500)
      setToken("")
      setUser(null)
      setAuthenticator(null)

      notification.success({
        message: `Bye!`,
        description: "You've successfully logged out",
      })
    } catch (err) {
      notification.error({
        message: "Failed to log out",
        description: err.toString(),
      })
    } finally {
      setLoggingOut(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        lastEmail,
        setLastEmail,
        token,
        user,
        authenticator,
        isLoggedIn,
        isLoggingIn,
        isLoggingOut,
        logIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
