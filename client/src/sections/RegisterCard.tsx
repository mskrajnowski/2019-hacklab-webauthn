import React, { FunctionComponent, useState } from "react"
import { Card, Result, PageHeader, notification } from "antd"
import axios from "axios"

import RegisterForm, { RegisterValues } from "./RegisterForm"

const initialValues: RegisterValues = { email: "", name: "" }

const RegisterCard: FunctionComponent = () => {
  const [success, setSuccess] = useState(false)

  const handleSubmit = async ({ email, name }: RegisterValues) => {
    try {
      const {
        data: { token },
      } = await axios.post("/register", {
        email,
        name,
      })

      await axios.post("/register/challenge", {
        token,
      })

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
