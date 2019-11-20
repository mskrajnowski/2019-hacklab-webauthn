import React, { FunctionComponent, useState } from "react"
import { Card, Result, PageHeader } from "antd"

import { delay } from "../utils"
import RegisterForm, { RegisterValues } from "./RegisterForm"

const initialValues: RegisterValues = { email: "", name: "" }

const RegisterCard: FunctionComponent = () => {
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (values: RegisterValues) => {
    console.log({ values })
    await delay(500)
    setSuccess(true)
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
