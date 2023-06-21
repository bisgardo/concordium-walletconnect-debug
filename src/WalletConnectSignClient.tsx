import { ISignClient } from "@walletconnect/types";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import Expiry from "./Expiry.tsx";
import Metadata from "./Metadata.tsx";
import Pairing from "./Pairing.tsx";
import Session from "./Session.tsx";

interface Props {
  client: ISignClient;
}

export default function WalletConnectSignClient({ client }: Props) {
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
                  <Card.Title>Metadata</Card.Title>
                  <Metadata metadata={client.metadata} />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mb-2">
        <Card.Header>Pairing ({client.core.pairing.pairings.length})</Card.Header>
        <Card.Body>
          <Pairing pairing={client.core.pairing} />
        </Card.Body>
      </Card>
      <Card className="mb-2">
        <Card.Header>Proposals ({client.proposal.length})</Card.Header>
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
            <Card.Header>Pending session requests ({client.getPendingSessionRequests().length})</Card.Header>
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
            <Card.Header>Sessions ({client.session.length})</Card.Header>
            <Card.Body>
              <ListGroup>
                {/* key in session map equals topic */}
                {[...client.session.map.values()].map((session, idx) => (
                  <ListGroup.Item key={idx}>
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
