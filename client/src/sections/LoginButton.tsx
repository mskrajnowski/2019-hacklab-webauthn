import React, { FunctionComponent, useContext } from "react"
import { Button } from "antd"
import { faFingerprint } from "@fortawesome/free-solid-svg-icons"

import AuthContext from "../context/AuthContext"
import FontAwesomeIcon from "../components/FontAwesomeIcon"

const LoginButton: FunctionComponent = () => {
  const { isLoggingIn, logIn } = useContext(AuthContext)

  return (
    <Button
      type="primary"
      size="large"
      block
      loading={isLoggingIn}
      onClick={logIn}
    >
      {!isLoggingIn && <FontAwesomeIcon type={faFingerprint} />}
      Log in
    </Button>
  )
}

export default LoginButton
