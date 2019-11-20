import React, { FunctionComponent } from "react"
import { Result } from "antd"
import { faFingerprint } from "@fortawesome/free-solid-svg-icons"

import FontAwesomeIcon from "./components/FontAwesomeIcon"

const App: FunctionComponent = () => (
  <Result
    status="info"
    icon={<FontAwesomeIcon type={faFingerprint} />}
    title="WebAuthn Demo"
    subTitle="Ant design + Font Awesome enabled"
  ></Result>
)

export default App
