import SignClient from "@walletconnect/sign-client";
import { SignClientTypes } from "@walletconnect/types";
import { Result, ResultAsync } from "neverthrow";
import { ReactElement, useCallback, useEffect, useReducer, useState } from "react";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import Client from "./Client.tsx";
import Events from "./Events.tsx";

const WALLET_CONNECT_OPTS: SignClientTypes.Options = {
  projectId: "76324905a70fe5c388bab46d3e0564dc",
  metadata: {
    name: "WalletConnect Debugger",
    description: "WalletConnector connection debugger",
    url: "#",
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
};

export default function App() {
  // Initialize SignClient immediately.
  const [client, setClient] = useState<Result<SignClient, Error>>();
  useEffect(() => {
    ResultAsync.fromPromise(SignClient.init(WALLET_CONNECT_OPTS), (err) => err as Error).then(setClient);
  }, []);

  // Force refresh "client" component tree as React doesn't track changes within it.
  // Using the dummy value as prop "key" to the 'Client' component would force a complete rebuild/redraw of the entire component tree.
  // This is not necessary for the components to refresh and would also clear output/error messages, which isn't what we want.
  const [refreshCount, forceUpdate] = useReducer((x) => x + 1, 0);

  // // Open connection as soon as client is initialized.
  // useEffect(() => {
  //   client?.map((c) =>
  //     connectWallet(c, "ccd:testnet", () => {
  //       // ignore cancel; i.e. if modal is closed
  //     })
  //   );
  // }, [client]);

  // Listen to all events and rendered them (directly from the 'Client' component).
  // This should automagically trigger a refresh of the whole subtree.
  // The explicit "refresh" button/action is still useful for clearing spinners and messages.
  const [eventElements, setEventElements] = useState<Array<ReactElement>>([]);
  const addEventElement = useCallback((e: ReactElement) => setEventElements([...eventElements, e]), [eventElements]);
  useEffect(() => {
    if (client) {
      client.map((client) => {
        console.log("Registering listeners for all events.");
        client.on("session_proposal", ({ id, params, verifyContext }) =>
          addEventElement(<>Session proposal: {JSON.stringify({ id, params, verifyContext })}</>)
        );
        client.on("session_update", ({ id, topic, params }) =>
          addEventElement(<>Session update: {JSON.stringify({ id, topic, params })}</>)
        );
        client.on("session_extend", ({ id, topic }) =>
          addEventElement(<>Session extend: {JSON.stringify({ id, topic })}</>)
        );
        client.on("session_ping", ({ id, topic }) =>
          addEventElement(<>Session ping: {JSON.stringify({ id, topic })}</>)
        );
        client.on("session_delete", ({ id, topic }) =>
          addEventElement(<> Session delete: {JSON.stringify({ id, topic })} </>)
        );
        client.on("session_expire", ({ topic }) => addEventElement(<>Session expire: {JSON.stringify({ topic })}</>));
        client.on("session_request", ({ id, topic, params, verifyContext }) =>
          addEventElement(<>Session request: {JSON.stringify({ id, topic, params, verifyContext })}</>)
        );
        client.on("session_request_sent", ({ id, topic, request, chainId }) =>
          addEventElement(<>Session request sent: {JSON.stringify({ id, topic, request, chainId })}</>)
        );
        client.on("session_event", ({ id, topic, params }) =>
          addEventElement(<> Session event: {JSON.stringify({ id, topic, params })} </>)
        );
        client.on("proposal_expire", ({ id }) => addEventElement(<>Proposal expire: {JSON.stringify({ id })}</>));
        return () => {
          console.log("Removing all event listeners.");
          client.removeAllListeners("session_proposal");
          client.removeAllListeners("session_update");
          client.removeAllListeners("session_extend");
          client.removeAllListeners("session_ping");
          client.removeAllListeners("session_delete");
          client.removeAllListeners("session_expire");
          client.removeAllListeners("session_request");
          client.removeAllListeners("session_request_sent");
          client.removeAllListeners("session_event");
          client.removeAllListeners("proposal_expire");
        };
      });
    }
  }, [client]);

  return (
    <Container fluid>
      <Row className="mt-3 mb-3">
        <Col>
          <h1>
            WalletConnect Debug Dashboard{" "}
            <Button size="sm" onClick={forceUpdate}>
              Refresh
            </Button>
          </h1>
          {client?.match(
            (client) => (
              <Client client={client} reset={refreshCount} />
            ),
            (err) => (
              <Alert variant="danger">
                Error initializing WalletConnect Sign Client.
                <pre className="mb-0">{err.toString()}</pre>
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
    </Container>
  );
}
