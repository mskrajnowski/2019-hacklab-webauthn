import React, {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
} from "react"
import { Layout, notification, PageHeader } from "antd"
import { faFingerprint } from "@fortawesome/free-solid-svg-icons"

import FontAwesomeIcon from "./components/FontAwesomeIcon"
import AuthContext, { User } from "./context/AuthContext"
import { delay } from "./utils"
import AuthenticatedSection from "./sections/AuthenticatedSection"
import AnonymousSection from "./sections/AnonymousSection"
import { login } from "./services/webauthn"

const App: FunctionComponent = () => {
  const [token, setToken] = useState(localStorage.getItem("auth.token") || "")
  const [user, setUser] = useState<User | null>(() => {
    const userJson = localStorage.getItem("auth.user")
    return userJson ? JSON.parse(userJson) : null
  })
  const [isLoggingIn, setLoggingIn] = useState(false)
  const [isLoggingOut, setLoggingOut] = useState(false)
  const isLoggedIn = !!user

  useEffect(() => {
    if (token && user) {
      localStorage.setItem("auth.token", token)
      localStorage.setItem("auth.user", JSON.stringify(user))
    } else {
      localStorage.removeItem("auth.token")
      localStorage.removeItem("auth.user")
    }
  }, [token, user])

  const logIn = useCallback(async (email: string) => {
    setLoggingIn(true)

    try {
      const { token, user } = await login(email)

      setToken(token)
      setUser(user)
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
        token,
        user,
        isLoggedIn,
        isLoggingIn,
        isLoggingOut,
        logIn,
        logOut,
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Layout.Content>
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              margin: "0 auto",
              padding: "16px",
            }}
          >
            <PageHeader
              title={
                <>
                  <FontAwesomeIcon type={faFingerprint} /> WebAuthn Demo
                </>
              }
              subTitle="hacklab @ codequest"
              style={{ padding: "32px 0" }}
            />
            {user ? <AuthenticatedSection /> : <AnonymousSection />}
          </div>
        </Layout.Content>
      </Layout>
    </AuthContext.Provider>
  )
}

export default App
