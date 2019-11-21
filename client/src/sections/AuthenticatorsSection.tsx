import React, { FunctionComponent } from "react"
import { Card, Row, Col, Icon, PageHeader, Button } from "antd"
import FontAwesomeIcon from "../components/FontAwesomeIcon"
import { faFingerprint } from "@fortawesome/free-solid-svg-icons"

interface Authenticator {
  id: string
  name: string
  type: "key" | "biometric"
}

const mockAuthenticators: Authenticator[] = [
  { id: "asd012", name: "yubikey", type: "key" },
  { id: "wer345", name: "phone", type: "biometric" },
]

const AuthenticatorsSection: FunctionComponent = () => {
  const authenticators = mockAuthenticators

  return (
    <>
      <PageHeader
        title="Your authenticators"
        extra={[
          <Button key="add" icon="plus">
            Add
          </Button>,
        ]}
        style={{ padding: "16px 0" }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        {authenticators.map(({ id, name, type }) => (
          <Col key={id} span={12}>
            <Card
              actions={[
                // <Icon type="edit" key="edit" />,
                <Icon type="delete" key="delete" />,
              ]}
            >
              <Card.Meta
                avatar={typeIcon(type)}
                title={id}
                // title={name}
                // description={id}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}

function typeIcon(type: Authenticator["type"]) {
  const commonProps = { style: { fontSize: "2em" } }

  switch (type) {
    case "key":
      return <Icon type="usb" {...commonProps} />
    case "biometric":
      return <FontAwesomeIcon type={faFingerprint} {...commonProps} />
    default:
      return null
  }
}

export default AuthenticatorsSection
