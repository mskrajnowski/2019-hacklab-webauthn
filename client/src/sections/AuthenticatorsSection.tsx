import React, {
  FunctionComponent,
  useContext,
  useCallback,
  ReactNode,
} from "react"
import { Card, Row, Col, Icon, PageHeader, Button, Tag, Timeline } from "antd"
import { faFingerprint } from "@fortawesome/free-solid-svg-icons"

import FontAwesomeIcon from "../components/FontAwesomeIcon"
import AuthenticatorsContext, {
  Authenticator,
} from "../context/AuthenticatorsContext"
import AuthContext from "../context/AuthContext"

const AuthenticatorsSection: FunctionComponent = () => {
  const { authenticators, addAuthenticator } = useContext(AuthenticatorsContext)

  return (
    <>
      <PageHeader
        title="Your authenticators"
        extra={[
          <Button key="add" icon="plus" onClick={addAuthenticator}>
            Add
          </Button>,
        ]}
        style={{ padding: "16px 0" }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        {authenticators.map(authenticator => (
          <Col key={authenticator.id} span={24}>
            <AuthenticatorCard authenticator={authenticator} />
          </Col>
        ))}
      </Row>
    </>
  )
}

interface AuthenticatorCardProps {
  authenticator: Authenticator
}

const AuthenticatorCard: FunctionComponent<AuthenticatorCardProps> = ({
  authenticator,
}) => {
  const { removeAuthenticator } = useContext(AuthenticatorsContext)
  const { id, name, created_at, last_used_at } = authenticator

  const { authenticator: currentAuthenticator } = useContext(AuthContext)
  const isCurrent = currentAuthenticator && id === currentAuthenticator.id

  const handleRemove = useCallback(() => removeAuthenticator(id), [
    id,
    removeAuthenticator,
  ])

  const actions: ReactNode[] = [
    // <Icon type="edit" key="edit" />,
  ]

  if (!isCurrent) {
    actions.push(<Icon type="delete" key="delete" onClick={handleRemove} />)
  }

  return (
    <Card actions={actions}>
      <Card.Meta
        avatar={typeIcon("key")}
        title={
          <>
            {name} {isCurrent && <Tag>current</Tag>}
          </>
        }
        description={
          <Timeline style={{ marginTop: "16px" }}>
            <Timeline.Item style={{ margin: 0 }}>
              Added {new Date(created_at).toLocaleString()}
            </Timeline.Item>
            {last_used_at && (
              <Timeline.Item style={{ margin: 0 }}>
                Last used {new Date(last_used_at).toLocaleString()}
              </Timeline.Item>
            )}
          </Timeline>
        }
      />
    </Card>
  )
}

function typeIcon(type: "key" | "biometric") {
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
