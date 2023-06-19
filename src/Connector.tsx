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
              <Card.Text>
                <Row>
                  <Col md={3}>
                    <Card.Title>Name</Card.Title>
                    {client.name}
                  </Col>
                  <Col md={3}>
                    <Card.Title>Context</Card.Title>
                    {client.context}
                  </Col>
                  <Col md={6}>
                    <Card.Title>Metadata</Card.Title>
                    <Metadata metadata={client.metadata} />
                  </Col>
                </Row>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mb-2">
        <Card.Header>Pairing</Card.Header>
        <Card.Body>
          <Card.Text>
            <Pairing pairing={client.core.pairing} />
          </Card.Text>
        </Card.Body>
      </Card>
      <Card className="mb-2">
        <Card.Header>Proposals</Card.Header>
        <Card.Body>
          <Card.Text>
            <ListGroup>
              {/* key in proposal map equals proposal ID */}
              {[...client.proposal.map.values()].map((proposal, idx) => (
                <ListGroup.Item key={idx}>
                  <div>Proposal ID: {proposal.id}</div>
                  <div>Proposer public key: {proposal.proposer.publicKey}</div>
                  <div>Proposer metadata:</div>
                  <Metadata metadata={proposal.proposer.metadata} />
                  <div>
                    Expiry: <Expiry unixSecs={proposal.expiry} />
                  </div>
                  <div>Pairing topic: {proposal.pairingTopic}</div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Text>
        </Card.Body>
      </Card>
      <Row>
        <Col md={6}>
          <Card className="mb-2">
            <Card.Header>Pending session requests</Card.Header>
            <Card.Body>
              <Card.Text>
                <ListGroup>
                  {client.getPendingSessionRequests().map((req, idx) => (
                    <ListGroup.Item key={idx}>
                      <div>Topic: {req.topic}</div>
                      <div>ID: {req.id}</div>
                      <div>Params: {JSON.stringify(req.params)}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-2">
            <Card.Header>Sessions</Card.Header>
            <Card.Body>
              <Card.Text>
                <ListGroup>
                  {/* TODO verify that map key is topic and then just use values */}
                  {[...client.session.map.entries()].map(([key, session], idx) => (
                    <ListGroup.Item key={idx}>
                      <div>Key: {key}</div>
                      <Session session={session} />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Text>
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
          {pairing.name}
        </Col>
        <Col>
          <Card.Title>Context</Card.Title>
          {pairing.context}
        </Col>
      </Row>
      <Row>
        <Col>
          <Card.Title>Pairings</Card.Title>
          <ListGroup>
            {/* key in pairings map equals topic */}
            {[...pairing.pairings.map.values()].map((pairing, idx) => (
              <ListGroup.Item key={idx}>
                <div>Topic: {pairing.topic}</div>
                <div>
                  Expiry:
                  <Expiry unixSecs={pairing.expiry} />
                </div>
                <div>Relay:</div>
                <ul>
                  <li>Protocol: {pairing.relay.protocol}</li>
                  <li>Data: {pairing.relay.data}</li>
                </ul>
                <div>Active: {pairing.active.toString()}</div>
                <div>Metadata:</div>
                {pairing.peerMetadata && <Metadata metadata={pairing.peerMetadata} />}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </>
  );
}
