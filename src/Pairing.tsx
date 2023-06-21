import { IPairing } from "@walletconnect/types";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import Expiry from "./Expiry.tsx";
import Metadata from "./Metadata.tsx";

interface PairingProps {
  pairing: IPairing;
}

export default function Pairing({ pairing }: PairingProps) {
  return (
    <>
      <Row className="mb-4">
        <Col>
          <Card.Title>Name</Card.Title>
          <Card.Text>{pairing.name}</Card.Text>
        </Col>
        <Col>
          <Card.Title>Context</Card.Title>
          <Card.Text>{pairing.context}</Card.Text>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card.Title>Pairings</Card.Title>
          <ListGroup>
            {/* key in pairings map equals topic */}
            {[...pairing.pairings.map.values()].map((pairing, idx) => (
              <ListGroup.Item key={idx}>
                <Card.Text>Topic: {pairing.topic}</Card.Text>
                <Card.Text>
                  Expiry: <Expiry unixSecs={pairing.expiry} />
                </Card.Text>
                Relay:
                <ul>
                  <li>Protocol: {pairing.relay.protocol}</li>
                  <li>Data: {pairing.relay.data ?? <i>None</i>}</li>
                </ul>
                <Card.Text>Active: {pairing.active.toString()}</Card.Text>
                Metadata: {(pairing.peerMetadata && <Metadata metadata={pairing.peerMetadata} />) ?? <i>None</i>}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </>
  );
}
