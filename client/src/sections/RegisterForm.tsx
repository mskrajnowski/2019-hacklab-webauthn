import React, { FunctionComponent } from "react"
import { Formik, FormikHelpers } from "formik"
import { Form, Input, SubmitButton } from "formik-antd"
import { faAt, faUser, faFingerprint } from "@fortawesome/free-solid-svg-icons"
import * as yup from "yup"

import FontAwesomeIcon from "../components/FontAwesomeIcon"
import { SchemaValue } from "../utils"

const prefixIconStyle = { color: "rgba(0,0,0,0.25)" }

const schema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid e-mail address")
    .required("E-mail address is required"),
  name: yup
    .string()
    .trim()
    .required("Full name is required"),
})

export type RegisterValues = SchemaValue<typeof schema>

export interface RegisterFormProps {
  initialValues: RegisterValues
  onSubmit: (values: RegisterValues) => void | Promise<void>
}

const RegisterForm: FunctionComponent<RegisterFormProps> = ({
  initialValues,
  onSubmit,
}) => {
  const handleSubmit = async (
    rawValues: RegisterValues,
    { setSubmitting }: FormikHelpers<RegisterValues>
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
              name="email"
              size="large"
              prefix={<FontAwesomeIcon type={faAt} style={prefixIconStyle} />}
              placeholder="E-mail address"
            />
          </Form.Item>

          <Form.Item name="name">
            <Input
              name="name"
              size="large"
              prefix={<FontAwesomeIcon type={faUser} style={prefixIconStyle} />}
              placeholder="Full name"
            />
          </Form.Item>

          <SubmitButton type="primary" block size="large">
            {!isSubmitting && <FontAwesomeIcon type={faFingerprint} />}
            Register
          </SubmitButton>
        </Form>
      )}
    </Formik>
  )
}

export default RegisterForm
