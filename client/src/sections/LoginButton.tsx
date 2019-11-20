import React, { FunctionComponent } from "react"
import { Button } from "antd"
import FontAwesomeIcon from "../components/FontAwesomeIcon"
import { faFingerprint } from "@fortawesome/free-solid-svg-icons"

const LoginButton: FunctionComponent = () => (
  <Button type="primary" size="large" block>
    <FontAwesomeIcon type={faFingerprint} />
    Log in
  </Button>
)

export default LoginButton
