import SignClient from "@walletconnect/sign-client";
import { SignClientTypes } from "@walletconnect/types";
import { Result, ResultAsync } from "neverthrow";
import { useEffect, useReducer, useState } from "react";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import Client from "./Client.tsx";
import { connect } from "./walletconnect.ts";

const WALLET_CONNECT_OPTS: SignClientTypes.Options = {
  projectId: "76324905a70fe5c388bab46d3e0564dc",
  metadata: {
    name: "WalletConnect Debugger",
    description: "WalletConnector connection debugger",
    url: "#",
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
};

// const SIGN_CLIENT_EVENTS: SignClientTypes.Event[] = [
//   "session_proposal",
//   "session_update",
//   "session_extend",
//   "session_ping",
//   "session_delete",
//   "session_expire",
//   "session_request",
//   "session_request_sent",
//   "session_event",
//   "proposal_expire",
// ];

export default function App() {
  // Initialize SignClient immediately.
  const [client, setClient] = useState<Result<SignClient, Error>>();
  useEffect(() => {
    ResultAsync.fromPromise(SignClient.init(WALLET_CONNECT_OPTS), (err) => err as Error).then(setClient);
  }, []);

  // Force refresh "client" component tree using "key" prop as React doesn't track changes within it.
  const [key, forceUpdate] = useReducer((x) => x + 1, 0);

  // // Register event handlers to refresh page on initialized client.
  // useEffect(() => {
  //   client?.map((client) => {
  //     SIGN_CLIENT_EVENTS.map((event) => {
  //       client.on(event, forceUpdate);
  //     });
  //   });
  // }, [client]);

  // Open connection as soon as client is initialized.
  useEffect(() => {
    client?.map((c) =>
      connect(c, "ccd:testnet", () => {
        // ignore cancel; i.e. if modal is closed
      })
    );
  }, [client]);

  return (
    <Container fluid>
      <Row className="mt-3 mb-3">
        <Col>
          <h1>
            WalletConnect Debugger{" "}
            <Button size="sm" onClick={forceUpdate}>
              Refresh
            </Button>
          </h1>
          {client?.match(
            (client) => (
              // Changing prop 'key' forces entire component subtree to not only re-render, but also re-draw.
              <Client key={key} client={client} />
            ),
            (err) => (
              <Alert>{err.toString()}</Alert>
            )
          )}
        </Col>
      </Row>
    </Container>
  );
}
