import React, { FunctionComponent, useContext } from "react"
import { Button } from "antd"

import AuthContext from "../context/AuthContext"

const LogoutButton: FunctionComponent = () => {
  const { isLoggingOut, logOut } = useContext(AuthContext)

  return (
    <Button
      type="primary"
      size="large"
      icon="logout"
      block
      loading={isLoggingOut}
      onClick={logOut}
    >
      Log out
    </Button>
  )
}

export default LogoutButton
