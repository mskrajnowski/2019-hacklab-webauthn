import React, { FunctionComponent, useContext } from "react"
import { Card, PageHeader, notification } from "antd"

import LoginForm, { LoginValues } from "./LoginForm"
import AuthContext from "../context/AuthContext"

const LoginCard: FunctionComponent = () => {
  const { logIn, lastEmail } = useContext(AuthContext)
  const initialValues: LoginValues = { email: lastEmail }

  const handleSubmit = async ({ email }: LoginValues) => {
    try {
      await logIn(email)
    } catch (err) {
      notification.error({
        message: "Login failed",
        description: err.message,
      })
    }
  }

  return (
    <Card title={<PageHeader title="Login" style={{ padding: 0 }} />}>
      <LoginForm initialValues={initialValues} onSubmit={handleSubmit} />
    </Card>
  )
}

export default LoginCard
