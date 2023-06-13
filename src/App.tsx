import { Col, Container, Row } from "react-bootstrap";
import Delegate, { ConnectionsProps } from "./Delegate.tsx";
import Connection from "./Connection.tsx";
import { useEffect, useState } from "react";
import { CONCORDIUM_WALLET_CONNECT_PROJECT_ID, TESTNET, WalletConnectConnector } from "@concordium/wallet-connectors";
import { SignClientTypes } from "@walletconnect/types";
import Connector from "./Connector.tsx";

const WALLET_CONNECT_OPTS: SignClientTypes.Options = {
  projectId: CONCORDIUM_WALLET_CONNECT_PROJECT_ID,
  metadata: {
    name: "WalletConnect Debugger",
    description: "WalletConnector connection debugger",
    url: "#",
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
};

export default function App() {
  return (
    <Delegate>
      {(props) => (
        <Container>
          <Row className="mt-3 mb-3">
            <Col>
              <h1>WalletConnect Debugger</h1>
              <Main {...props} />
            </Col>
          </Row>
        </Container>
      )}
    </Delegate>
  );
}

function Main({ connections, delegate }: ConnectionsProps) {
  const [connector, setConnector] = useState<WalletConnectConnector>();
  useEffect(() => {
    if (delegate) {
      WalletConnectConnector.create(WALLET_CONNECT_OPTS, delegate, TESTNET).then(setConnector).catch(console.error);
    }
  }, [delegate]);
  useEffect(() => {
    if (connector) {
      connector.connect().catch(console.error);
    }
  }, [connector]);

  return (
    <>
      {connector && (
        <>
          <h2>Connector</h2>
          <Connector connector={connector} />
        </>
      )}

      {[...connections.entries()].map(([connection, { account, chain }], idx) => (
        <div key={idx}>
          <h2>Connection #{idx}</h2>
          <Connection connection={connection} account={account} chain={chain} />
        </div>
      ))}
    </>
  );
}
