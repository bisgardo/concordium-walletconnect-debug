import { WalletConnectConnector } from "@concordium/wallet-connectors";
import Session from "./Session.tsx";
import Metadata from "./Metadata.tsx";
import { IPairing } from "@walletconnect/types";
import { Card, Col, ListGroup, Row } from "react-bootstrap";

interface Props {
  connector: WalletConnectConnector;
}

export default function Connector({ connector }: Props) {
  const { client } = connector;
  // TODO Force refresh periodically or listen to all events (and refresh on them).
  return (
    <>
      <Row>
        <Col>
          <Card className="mb-2">
            <Card.Header>Client</Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Card.Title>Name</Card.Title>
                  <Card.Text>{client.name}</Card.Text>
                </Col>
                <Col md={3}>
                  <Card.Title>Context</Card.Title>
                  <Card.Text>{client.context}</Card.Text>
                </Col>
                <Col md={6}>
                  Metadata:
                  <Metadata metadata={client.metadata} />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mb-2">
        <Card.Header>Pairing</Card.Header>
        <Card.Body>
          <Pairing pairing={client.core.pairing} />
        </Card.Body>
      </Card>
      <Card className="mb-2">
        <Card.Header>Proposals</Card.Header>
        <Card.Body>
          <ListGroup>
            {/* key in proposal map equals proposal ID */}
            {[...client.proposal.map.values()].map((proposal, idx) => (
              <ListGroup.Item key={idx}>
                <Card.Text>Proposal ID: {proposal.id}</Card.Text>
                <Card.Text>Proposer public key: {proposal.proposer.publicKey}</Card.Text>
                Proposer metadata:
                <Metadata metadata={proposal.proposer.metadata} />
                <Card.Text>
                  Expiry: <Expiry unixSecs={proposal.expiry} />
                </Card.Text>
                <Card.Text>Pairing topic: {proposal.pairingTopic ?? <i>None</i>}</Card.Text>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
      <Row>
        <Col md={6}>
          <Card className="mb-2">
            <Card.Header>Pending session requests</Card.Header>
            <Card.Body>
              <ListGroup>
                {client.getPendingSessionRequests().map((req, idx) => (
                  <ListGroup.Item key={idx}>
                    <Card.Text>Topic: {req.topic}</Card.Text>
                    <Card.Text>ID: {req.id}</Card.Text>
                    <Card.Text>Params: {JSON.stringify(req.params)}</Card.Text>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-2">
            <Card.Header>Sessions</Card.Header>
            <Card.Body>
              <ListGroup>
                {/* TODO verify that map key is topic and then just use values */}
                {[...client.session.map.entries()].map(([key, session], idx) => (
                  <ListGroup.Item key={idx}>
                    <Card.Text>Key: {key}</Card.Text>
                    <Session session={session} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

interface PairingProps {
  pairing: IPairing;
}

function Expiry({ unixSecs }: { unixSecs: number }) {
  return (
    <>
      {new Date(unixSecs * 1000).toISOString()} ({unixSecs})
    </>
  );
}

function Pairing({ pairing }: PairingProps) {
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
