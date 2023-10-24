import { WalletConnectModal } from "@walletconnect/modal";
import { ISignClient, SessionTypes } from "@walletconnect/types";
import { Alert, Button, Card, Col, FloatingLabel, Form, ListGroup, Row, Spinner } from "react-bootstrap";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { Result, ResultAsync } from "neverthrow";
import Err from "./Err.tsx";
import Expiry from "./Expiry.tsx";
import Metadata from "./Metadata.tsx";
import Pairing from "./Pairing.tsx";
import Session from "./Session.tsx";
import Events from "./Events.tsx";

interface Props {
  client: ISignClient;
  eventElements: Array<ReactElement>;
  reset: number;
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
  code: 1111,
  message: "Too boring",
});

const DEFAULT_REQUEST_METHOD = "sign_and_send_transaction";
const DEFAULT_REQUEST_PARAMS = JSON.stringify(
  {
    type: "Update",
    schema: "",
    sender: "",
    payload: JSON.stringify({
      amount: "0",
      address: { index: 0, subindex: 0 },
      receiveName: "contract.func",
      maxContractExecutionEnergy: 10000,
      message: "",
    }),
  },
  null,
  2
);

const parse = Result.fromThrowable(JSON.parse, (err) => err as Error);

export default function Client({ client, eventElements, reset }: Props) {
  const [connectParams, setConnectParams] = useState(DEFAULT_CONNECT_PARAMS);
  const [connectResult, setConnectResult] = useState<Result<SessionTypes.Struct | undefined, unknown>>();
  const [connecting, setConnecting] = useState(false);
  const clearConnectResult = useCallback(() => setConnectResult(undefined), []);
  const connect = useCallback(() => {
    // TODO Construct config somewhere outside.
    const modal = new WalletConnectModal({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      projectId: client.core.projectId!,
      enableExplorer: true,
      mobileWallets: [
        {
          id: "concordium-debug",
          name: "Concordium (debug)",
          links: {
            native: "concordiumwallet",
            universal: "wallet.concordium.software",
          },
        },
      ],
    });
    modal.subscribeModal(({ open }) => setConnecting(open));
    clearConnectResult();
    return parse(connectParams)
      .asyncAndThen((params) =>
        ResultAsync.fromPromise(
          new Promise<SessionTypes.Struct | undefined>((resolve, reject) =>
            client
              .connect(params)
              .then(({ uri, approval }) => {
                let res = Promise.resolve();
                if (uri) {
                  // Open modal as we're not connecting to an existing pairing.
                  res = res.then(() => modal.openModal({ uri }));
                }
                return res.then(approval);
              })
              .then(resolve, reject)
              .finally(() => modal.closeModal())
          ),
          (err) => err
        )
      )
      .then(setConnectResult);
  }, [client, connectParams, clearConnectResult]);

  const [disconnectTopic, setDisconnectTopic] = useState("");
  const [disconnectReason, setDisconnectReason] = useState(DEFAULT_DISCONNECT_REASON);
  const [disconnectResult, setDisconnectResult] = useState<Result<void, unknown>>();
  const [disconnecting, setDisconnecting] = useState(false);
  const clearDisconnectResult = useCallback(() => setDisconnectResult(undefined), []);
  const disconnect = useCallback(() => {
    clearDisconnectResult();
    setDisconnecting(true);
    return parse(disconnectReason)
      .asyncAndThen((reason) =>
        ResultAsync.fromPromise(
          client.disconnect({
            topic: disconnectTopic,
            reason,
          }),
          (err) => err
        )
      )
      .then(setDisconnectResult)
      .then(() => setDisconnecting(false));
  }, [client, disconnectTopic, disconnectReason, clearDisconnectResult]);

  const [requestTopic, setRequestTopic] = useState("");
  const [requestChain, setRequestChain] = useState("ccd:testnet");
  const [requestMethod, setRequestMethod] = useState(DEFAULT_REQUEST_METHOD);
  const [requestParams, setRequestParams] = useState(DEFAULT_REQUEST_PARAMS);
  const [requestResult, setRequestResult] = useState<Result<unknown, unknown>>();
  const [requesting, setRequesting] = useState(false);
  const clearRequestResult = useCallback(() => setRequestResult(undefined), []);
  const sendRequest = useCallback(() => {
    clearRequestResult();
    setRequesting(true);
    return parse(requestParams)
      .asyncAndThen((params) =>
        ResultAsync.fromPromise(
          client.request({
            topic: requestTopic,
            request: { method: requestMethod, params },
            chainId: requestChain,
          }),
          (err) => err
        )
      )
      .then(setRequestResult)
      .then(() => setRequesting(false));
  }, [client, requestTopic, requestChain, requestMethod, requestParams, clearRequestResult]);
  useEffect(() => {
    setConnecting(false);
    setDisconnecting(false);
    setRequesting(false);
    clearConnectResult();
    clearDisconnectResult();
    clearRequestResult();
  }, [reset, clearConnectResult, clearDisconnectResult, clearRequestResult]);
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
                  <Button onClick={connect} disabled={connecting}>
                    {connecting ? <Spinner size="sm" /> : "Connect"}
                  </Button>
                  {connectResult?.match(
                    (session) => (
                      <>
                        {session && (
                          <>
                            <Alert variant="success" className="mt-2" dismissible onClose={clearConnectResult}>
                              Session with topic <code title={JSON.stringify(session, null, 2)}>{session?.topic}</code>{" "}
                              created
                            </Alert>
                          </>
                        )}
                        {!session && (
                          <Alert variant="warning" className="mt-2" dismissible onClose={clearConnectResult}>
                            No session created
                          </Alert>
                        )}
                      </>
                    ),
                    (err) => (
                      <Alert variant="danger" className="mt-2" dismissible onClose={clearConnectResult}>
                        <Err err={err} />
                      </Alert>
                    )
                  )}
                </Col>
                <Col>
                  <Card.Title>Disconnect</Card.Title>
                  <FloatingLabel label="Topic" className="mb-2">
                    <Form.Control
                      type="text"
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
                  <Button variant="danger" onClick={disconnect} disabled={disconnecting}>
                    {disconnecting ? <Spinner size="sm" /> : "Disconnect"}
                  </Button>
                  {disconnectResult?.match(
                    () => (
                      <Alert variant="success" className="mt-2" dismissible onClose={clearDisconnectResult}>
                        OK
                      </Alert>
                    ),
                    (err) => (
                      <Alert variant="danger" className="mt-2" dismissible onClose={clearDisconnectResult}>
                        <Err err={err} />
                      </Alert>
                    )
                  )}
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <Card.Title>Request</Card.Title>
                  <FloatingLabel label="Topic" className="mb-2">
                    <Form.Control type="text" value={requestTopic} onChange={(e) => setRequestTopic(e.target.value)} />
                  </FloatingLabel>
                  <FloatingLabel label="Chain" className="mb-2">
                    <Form.Control type="text" value={requestChain} onChange={(e) => setRequestChain(e.target.value)} />
                  </FloatingLabel>
                  <FloatingLabel label="Method" className="mb-2">
                    <Form.Control
                      type="text"
                      value={requestMethod}
                      onChange={(e) => setRequestMethod(e.target.value)}
                    />
                  </FloatingLabel>
                  <FloatingLabel label="Params (JSON)" className="mb-2">
                    <Form.Control
                      as="textarea"
                      style={{ height: "10em" }}
                      value={requestParams}
                      onChange={(e) => setRequestParams(e.target.value)}
                    />
                  </FloatingLabel>
                  <FloatingLabel label="Expiry (not yet supported)" className="mb-2">
                    <Form.Control type="text" value={""} disabled />
                  </FloatingLabel>
                  <Button onClick={sendRequest} disabled={requesting}>
                    {requesting ? <Spinner size="sm" /> : "Send"}
                  </Button>
                  {requestResult?.match(
                    (res) => (
                      <Alert variant="success" className="mt-2" dismissible onClose={clearRequestResult}>
                        Response:
                        <pre className="mb-0">{typeof res === "string" ? res : JSON.stringify(res, null, 2)}</pre>
                      </Alert>
                    ),
                    (err) => (
                      <Alert variant="danger" className="mt-2" dismissible onClose={clearRequestResult}>
                        <Err err={err} />
                      </Alert>
                    )
                  )}
                </Col>
              </Row>
              <Row>
                <Col>
                  <Events eventElements={eventElements} />
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
