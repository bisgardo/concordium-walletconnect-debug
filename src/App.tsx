import SignClient from "@walletconnect/sign-client";
import { SignClientTypes } from "@walletconnect/types";
import { Result, ResultAsync } from "neverthrow";
import { ReactElement, useCallback, useEffect, useReducer, useState } from "react";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import Client from "./Client.tsx";

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
        type EA = SignClientTypes.EventArguments;
        const onSessionProposal = ({ id, params, verifyContext }: EA["session_proposal"]) =>
          addEventElement(
            <>
              Session proposed: <code>{JSON.stringify({ id, params, verifyContext })}</code>
            </>
          );
        const onSessionUpdate = ({ id, topic, params }: EA["session_update"]) =>
          addEventElement(
            <>
              Session updated: <code>{JSON.stringify({ id, topic, params })}</code>
            </>
          );
        const onSessionExtend = ({ id, topic }: EA["session_extend"]) =>
          addEventElement(
            <>
              Session extended: <code>{JSON.stringify({ id, topic })}</code>
            </>
          );
        const onSessionPing = ({ id, topic }: EA["session_ping"]) =>
          addEventElement(
            <>
              Session pinged: <code>{JSON.stringify({ id, topic })}</code>
            </>
          );
        const onSessionDelete = ({ id, topic }: EA["session_delete"]) =>
          addEventElement(
            <>
              Session deleted: <code>{JSON.stringify({ id, topic })}</code>
            </>
          );
        const onSessionExpire = ({ topic }: EA["session_expire"]) =>
          addEventElement(
            <>
              Session expired: <code>{JSON.stringify({ topic })}</code>
            </>
          );
        const onSessionRequest = ({ id, topic, params, verifyContext }: EA["session_request"]) =>
          addEventElement(
            <>
              Request received: <code>{JSON.stringify({ id, topic, params, verifyContext })}</code>
            </>
          );
        const onSessionRequestSent = ({ id, topic, request, chainId }: EA["session_request_sent"]) =>
          addEventElement(
            <>
              Request sent: <code>{JSON.stringify({ id, topic, request, chainId })}</code>
            </>
          );
        const onSessionEvent = ({ id, topic, params }: EA["session_event"]) =>
          addEventElement(
            <>
              Session event: <code>{JSON.stringify({ id, topic, params })}</code>
            </>
          );
        const onProposalExpire = ({ id }: EA["proposal_expire"]) =>
          addEventElement(
            <>
              Proposal expired: <code>{JSON.stringify({ id })}</code>
            </>
          );
        client.on("session_proposal", onSessionProposal);
        client.on("session_update", onSessionUpdate);
        client.on("session_extend", onSessionExtend);
        client.on("session_ping", onSessionPing);
        client.on("session_delete", onSessionDelete);
        client.on("session_expire", onSessionExpire);
        client.on("session_request", onSessionRequest);
        client.on("session_request_sent", onSessionRequestSent);
        client.on("session_event", onSessionEvent);
        client.on("proposal_expire", onProposalExpire);
        return () => {
          console.log("Removing previously registered event listeners.");
          client.off("session_proposal", onSessionProposal);
          client.off("session_update", onSessionUpdate);
          client.off("session_extend", onSessionExtend);
          client.off("session_ping", onSessionPing);
          client.off("session_delete", onSessionDelete);
          client.off("session_expire", onSessionExpire);
          client.off("session_request", onSessionRequest);
          client.off("session_request_sent", onSessionRequestSent);
          client.off("session_event", onSessionEvent);
          client.off("proposal_expire", onProposalExpire);
        };
      });
    }
  }, [client, addEventElement]);

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
              <Client client={client} eventElements={eventElements} reset={refreshCount} />
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
    </Container>
  );
}
