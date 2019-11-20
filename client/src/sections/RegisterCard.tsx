import React, { FunctionComponent } from "react"
import { Card, Form, Input, Button } from "antd"
import FontAwesomeIcon from "../components/FontAwesomeIcon"
import { faAt, faUser, faFingerprint } from "@fortawesome/free-solid-svg-icons"

const prefixIconStyle = { color: "rgba(0,0,0,0.25)" }

const RegisterCard: FunctionComponent = () => (
  <Card title="Register" headStyle={{ textAlign: "center" }}>
    <Form layout="vertical">
      <Form.Item required>
        <Input
          size="large"
          prefix={<FontAwesomeIcon type={faAt} style={prefixIconStyle} />}
          placeholder="E-mail address"
        />
      </Form.Item>
      <Form.Item required>
        <Input
          size="large"
          prefix={<FontAwesomeIcon type={faUser} style={prefixIconStyle} />}
          placeholder="Full name"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large">
          <FontAwesomeIcon type={faFingerprint} />
          Register
        </Button>
      </Form.Item>
    </Form>
  </Card>
)

export default RegisterCard
