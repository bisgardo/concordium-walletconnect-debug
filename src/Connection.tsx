import { WalletConnectConnection } from "@concordium/wallet-connectors";
import { useCallback } from "react";
import Session from "./Session.tsx";
import { Card, Col, Row } from "react-bootstrap";

interface Props {
  connection: WalletConnectConnection;
  account: string | undefined;
  chain: string | undefined;
}

export default function Connection({ connection, account, chain }: Props) {
  const disconnect = useCallback(() => connection.disconnect().catch(console.error), [connection]);
  return (
    <Card>
      <Card.Body>
        <Row>
          <Col>
            <Card.Title>Account</Card.Title>
            <Card.Text>{account}</Card.Text>
          </Col>
          <Col>
            <Card.Title>Chain</Card.Title>
            <Card.Text>{chain}</Card.Text>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card.Title>Session</Card.Title>
            <Session session={connection.session} />
          </Col>
        </Row>
        <Row>
          <Col>
            <button className="btn btn-danger" onClick={disconnect}>
              Disconnect
            </button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
