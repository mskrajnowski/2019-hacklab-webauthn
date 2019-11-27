import React, { FunctionComponent, useState, useContext } from "react"
import { Card, Result, PageHeader, notification } from "antd"

import RegisterForm, { RegisterValues } from "./RegisterForm"
import { register } from "../services/webauthn"
import AuthContext from "../context/AuthContext"

const initialValues: RegisterValues = { email: "", name: "" }

const RegisterCard: FunctionComponent = () => {
  const [success, setSuccess] = useState(false)
  const { setLastEmail } = useContext(AuthContext)

  const handleSubmit = async ({ email, name }: RegisterValues) => {
    try {
      await register(email, name)
      setLastEmail(email)
      setSuccess(true)
    } catch (err) {
      notification.error({
        message: "Registration failed",
        description: err.message,
      })
    }
  }

  const handleBack = success ? () => setSuccess(false) : undefined

  return (
    <Card
      title={
        <PageHeader
          title="Register"
          onBack={handleBack}
          style={{ padding: 0 }}
        />
      }
    >
      {success ? (
        <Result
          status="success"
          title="Thanks for registering"
          subTitle="Now try logging in!"
        />
      ) : (
        <RegisterForm initialValues={initialValues} onSubmit={handleSubmit} />
      )}
    </Card>
  )
}

export default RegisterCard
