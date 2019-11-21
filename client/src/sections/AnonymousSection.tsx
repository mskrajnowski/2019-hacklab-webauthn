import React, { FunctionComponent } from "react"
import { Divider } from "antd"

import LoginButton from "./LoginButton"
import RegisterCard from "./RegisterCard"

const AnonymousSection: FunctionComponent = () => (
  <>
    <LoginButton />
    <Divider>or</Divider>
    <RegisterCard />
  </>
)

export default AnonymousSection
