import React, { FunctionComponent, useContext } from "react"
import { Result } from "antd"

import AuthContext from "../context/AuthContext"
import LogoutButton from "./LogoutButton"
import FontAwesomeIcon from "../components/FontAwesomeIcon"
import { faUserCircle } from "@fortawesome/free-solid-svg-icons"
import AuthenticatorsSection from "./AuthenticatorsSection"

const AuthenticatedSection: FunctionComponent = () => {
  const { user } = useContext(AuthContext)

  return (
    <>
      <Result
        status="info"
        icon={<FontAwesomeIcon type={faUserCircle} />}
        title={<>Hi {user!.name}!</>}
        subTitle={user!.email}
      />
      <AuthenticatorsSection />
      <LogoutButton />
    </>
  )
}

export default AuthenticatedSection
