import React, { FunctionComponent } from "react"
import { Divider } from "antd"

import LoginCard from "./LoginCard"
import RegisterCard from "./RegisterCard"

const AnonymousSection: FunctionComponent = () => (
  <>
    <LoginCard />
    <Divider>or</Divider>
    <RegisterCard />
  </>
)

export default AnonymousSection
