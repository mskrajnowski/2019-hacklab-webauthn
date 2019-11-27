import React, { FunctionComponent, useContext } from "react"
import { Layout, PageHeader } from "antd"
import { faFingerprint } from "@fortawesome/free-solid-svg-icons"

import FontAwesomeIcon from "./components/FontAwesomeIcon"
import AuthContext, { AuthProvider } from "./context/AuthContext"
import AuthenticatedSection from "./sections/AuthenticatedSection"
import AnonymousSection from "./sections/AnonymousSection"

const App: FunctionComponent = () => {
  return (
    <AuthProvider>
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
            <Main />
          </div>
        </Layout.Content>
      </Layout>
    </AuthProvider>
  )
}

const Main: FunctionComponent = () => {
  const { user } = useContext(AuthContext)
  return user ? <AuthenticatedSection /> : <AnonymousSection />
}

export default App
