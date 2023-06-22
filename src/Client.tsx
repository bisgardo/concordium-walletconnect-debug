import { ISignClient, SessionTypes } from "@walletconnect/types";
import { Alert, Button, Card, Col, FloatingLabel, Form, ListGroup, Row } from "react-bootstrap";
import Expiry from "./Expiry.tsx";
import Metadata from "./Metadata.tsx";
import Pairing from "./Pairing.tsx";
import Session from "./Session.tsx";
import { useCallback, useState } from "react";
import { connectWallet } from "./walletconnect.ts";
import { Result, ResultAsync } from "neverthrow";

interface Props {
  client: ISignClient;
}

const DEFAULT_CONNECT_PARAMS = JSON.stringify(
  {
    requiredNamespaces: {
      ccd: {
        methods: ["sign_and_send_transaction", "sign_message"],
        chains: ["ccd:testnet"],
        events: ["chain_changed", "accounts_changed"],
      },
    },
  },
  null,
  2
);
const DEFAULT_DISCONNECT_REASON = JSON.stringify({
  code: 500,
  message: "Bad luck",
});

const parse = Result.fromThrowable(JSON.parse, (err) => err as Error);

export default function Client({ client }: Props) {
  const [connectParams, setConnectParams] = useState(DEFAULT_CONNECT_PARAMS);
  const [connectResult, setConnectResult] = useState<Result<SessionTypes.Struct | undefined, Error>>(); // TODO !!!
  const dismissConnectResult = useCallback(() => setConnectResult(undefined), []);
  const connect = useCallback(() => {
    dismissConnectResult();
    return parse(connectParams)
      .asyncAndThen((params) =>
        ResultAsync.fromPromise(
          connectWallet(client, params, () => {
            /* ignore closing modal */
          }), // TODO cancel is also called on error...
          (err) => err as Error
        )
      )
      .then(setConnectResult);
  }, [client, connectParams]);

  const [disconnectTopic, setDisconnectTopic] = useState("");
  const [disconnectReason, setDisconnectReason] = useState(DEFAULT_DISCONNECT_REASON);
  const [disconnectResult, setDisconnectResult] = useState<Result<void, Error>>();
  const dismissDisconnectResult = useCallback(() => setDisconnectResult(undefined), []);
  const disconnect = useCallback(() => {
    dismissDisconnectResult();
    return parse(disconnectReason)
      .asyncAndThen((reason) =>
        ResultAsync.fromPromise(
          client.disconnect({
            topic: disconnectTopic,
            reason,
          }),
          (err) => err as Error
        )
      )
      .then(setDisconnectResult);
  }, [client, disconnectTopic, disconnectReason]);
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
              <Row>
                <Col>
                  <Card.Title>Connect</Card.Title>
                  <FloatingLabel label="Parameters" className="mb-2">
                    <Form.Control
                      as="textarea"
                      style={{ height: "10em" }}
                      value={connectParams}
                      onChange={(e) => setConnectParams(e.target.value)}
                    />
                  </FloatingLabel>
                  <Button onClick={connect}>Connect</Button>
                  {connectResult?.match(
                    (session) => (
                      <>
                        {session && (
                          <>
                            <Alert variant="success" dismissible onClose={dismissConnectResult}>
                              Session with topic <code title={JSON.stringify(session, null, 2)}>{session?.topic}</code>{" "}
                              created
                            </Alert>
                          </>
                        )}
                        {!session && (
                          <Alert variant="warning" dismissible onClose={dismissConnectResult}>
                            No session created
                          </Alert>
                        )}
                      </>
                    ),
                    (err) => (
                      <Alert variant="danger" dismissible onClose={dismissConnectResult}>
                        {err.toString()}
                      </Alert>
                    )
                  )}
                </Col>
                <Col>
                  <Card.Title>Disconnect</Card.Title>
                  <FloatingLabel label="Topic" className="mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Topic"
                      value={disconnectTopic}
                      onChange={(e) => setDisconnectTopic(e.target.value)}
                    />
                  </FloatingLabel>
                  <FloatingLabel label="Reason ({code, message, data?})" className="mb-2">
                    <Form.Control
                      type="text"
                      placeholder="None"
                      value={disconnectReason}
                      onChange={(e) => setDisconnectReason(e.target.value)}
                    />
                  </FloatingLabel>
                  <Button variant="danger" onClick={disconnect}>
                    Disconnect
                  </Button>
                  {disconnectResult?.match(
                    () => (
                      <Alert variant="success" className="mt-2" dismissible onClose={dismissDisconnectResult}>
                        OK
                      </Alert>
                    ),
                    (err) => (
                      <Alert variant="danger" className="mt-2" dismissible onClose={dismissDisconnectResult}>
                        {err.toString()}
                      </Alert>
                    )
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="mb-2">
            <Card.Header>Pairing</Card.Header>
            <Card.Body>
              <Pairing pairing={client.core.pairing} />
            </Card.Body>
          </Card>
        </Col>
        <Col>
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
        </Col>
      </Row>
      <Row>
        <Col>
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
        <Col>
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
      </Row>
    </>
  );
}
