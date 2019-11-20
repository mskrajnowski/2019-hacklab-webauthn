import React, { FunctionComponent } from "react"
import { Result, Layout, Divider } from "antd"
import { faFingerprint } from "@fortawesome/free-solid-svg-icons"

import FontAwesomeIcon from "./components/FontAwesomeIcon"
import LoginButton from "./sections/LoginButton"
import RegisterCard from "./sections/RegisterCard"

const App: FunctionComponent = () => (
  <Layout style={{ minHeight: "100vh" }}>
    <Layout.Content>
      <Result
        status="info"
        icon={<FontAwesomeIcon type={faFingerprint} />}
        title="WebAuthn Demo"
        subTitle="hacklab @ codequest"
      />

      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
          padding: "16px",
        }}
      >
        <LoginButton />
        <Divider>or</Divider>
        <RegisterCard />
      </div>
    </Layout.Content>
  </Layout>
)

export default App
