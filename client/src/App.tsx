import React, { FunctionComponent, useState, useCallback } from "react"
import { Layout, notification, PageHeader } from "antd"
import { faFingerprint } from "@fortawesome/free-solid-svg-icons"

import FontAwesomeIcon from "./components/FontAwesomeIcon"
import AuthContext, { User } from "./context/AuthContext"
import { delay } from "./utils"
import AuthenticatedSection from "./sections/AuthenticatedSection"
import AnonymousSection from "./sections/AnonymousSection"

const App: FunctionComponent = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggingIn, setLoggingIn] = useState(false)
  const [isLoggingOut, setLoggingOut] = useState(false)
  const isLoggedIn = !!user

  const logIn = useCallback(async () => {
    setLoggingIn(true)

    try {
      await delay(500)
      const user = {
        id: "1",
        email: "john@doe.com",
        name: "John Doe",
      }

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
      value={{ user, isLoggedIn, isLoggingIn, isLoggingOut, logIn, logOut }}
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
