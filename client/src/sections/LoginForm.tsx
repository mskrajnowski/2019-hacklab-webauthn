import React, { FunctionComponent } from "react"
import { Formik, FormikHelpers } from "formik"
import { Form, Input, SubmitButton } from "formik-antd"
import { faAt, faFingerprint } from "@fortawesome/free-solid-svg-icons"
import * as yup from "yup"

import FontAwesomeIcon from "../components/FontAwesomeIcon"
import { SchemaValue } from "../utils"

const prefixIconStyle = { color: "rgba(0,0,0,0.25)" }

const schema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid e-mail address")
    .required("E-mail address is required"),
})

export type LoginValues = SchemaValue<typeof schema>

export interface LoginFormProps {
  initialValues: LoginValues
  onSubmit: (values: LoginValues) => void | Promise<void>
}

const LoginForm: FunctionComponent<LoginFormProps> = ({
  initialValues,
  onSubmit,
}) => {
  const handleSubmit = async (
    rawValues: LoginValues,
    { setSubmitting }: FormikHelpers<LoginValues>
  ) => {
    const values = schema.cast(rawValues)

    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <Form.Item name="email">
            <Input
              type="email"
              name="email"
              size="large"
              prefix={<FontAwesomeIcon type={faAt} style={prefixIconStyle} />}
              placeholder="E-mail address"
            />
          </Form.Item>

          <SubmitButton type="primary" block size="large">
            {!isSubmitting && <FontAwesomeIcon type={faFingerprint} />}
            Log in
          </SubmitButton>
        </Form>
      )}
    </Formik>
  )
}

export default LoginForm
