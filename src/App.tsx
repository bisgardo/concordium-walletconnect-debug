import {
  CONCORDIUM_WALLET_CONNECT_PROJECT_ID,
  TESTNET,
  WalletConnectConnector,
} from "@concordium/wallet-connectors";
import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";
import { SignClientTypes } from "@walletconnect/types";
import Delegate, { ConnectionsProps } from "./Delegate.tsx";

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
          <h1>WalletConnect test</h1>
          <Connections {...props} />
        </Container>
      )}
    </Delegate>
  );
}

function Connections({ connections, delegate }: ConnectionsProps) {
  const [connector, setConnector] = useState<WalletConnectConnector>();
  useEffect(() => {
    if (delegate) {
      WalletConnectConnector.create(WALLET_CONNECT_OPTS, delegate, TESTNET)
        .then(setConnector)
        .catch(console.error);
    }
  }, [delegate]);
  useEffect(() => {
    if (connector) {
      connector.connect().catch(console.error);
    }
  }, [connector]);

  return (
    <>
      {[...connections.entries()].map(
        ([connection, { account, chain }], idx) => (
          <div key={idx}>
            <h3>Connection</h3>
            <h4>Account</h4>
            {account}
            <h4>Chain</h4>
            {chain}
            <h4>Session</h4>
            <ul>
              <li>Topic: {connection.session.topic}</li>
              <li>Relay protocol: {connection.session.relay.protocol}</li>
              <li>Relay data: {connection.session.relay.data}</li>
              <li>Expiry: {connection.session.expiry}</li>
              <li>Acknowledged: {connection.session.acknowledged}</li>
              <li>Controller: {connection.session.controller}</li>
              <li>
                Namespaces:
                <ul>
                  {connection.session.namespaces &&
                    Object.entries(connection.session.namespaces).map(
                      ([key, ns]) => (
                        <li key={key}>
                          Key: {key}
                          Accounts: {ns.accounts.join(", ")}
                          Methods: {ns.methods.join(", ")}
                          Events: {ns.events.join(", ")}
                          Extension: {JSON.stringify(ns.extension)}
                        </li>
                      )
                    )}
                </ul>
              </li>
              <li>
                Required namespaces:
                <ul>
                  {connection.session.requiredNamespaces &&
                    Object.entries(connection.session.requiredNamespaces).map(
                      ([key, ns]) => (
                        <li key={key}>
                          Key: {key}
                          Chains: {ns.chains.join(", ")}
                          Methods: {ns.methods.join(", ")}
                          Events: {ns.events.join(", ")}
                          Extension: {JSON.stringify(ns.extension)}
                        </li>
                      )
                    )}
                </ul>
              </li>
              <li>Self public key: {connection.session.self.publicKey}</li>
              <li>
                Self metadata name: {connection.session.self.metadata.name}
              </li>
              <li>Self metadata url: {connection.session.self.metadata.url}</li>
              <li>
                Self metadata icons:{" "}
                {connection.session.self.metadata.icons.join(", ")}
              </li>
              <li>
                Self metadata description:{" "}
                {connection.session.self.metadata.description}
              </li>
              <li>Peer public key: {connection.session.peer.publicKey}</li>
              <li>
                Peer metadata name: {connection.session.peer.metadata.name}
              </li>
              <li>Peer metadata url: {connection.session.peer.metadata.url}</li>
              <li>
                Peer metadata icons:{" "}
                {connection.session.peer.metadata.icons.join(", ")}
              </li>
              <li>
                Peer metadata description:{" "}
                {connection.session.peer.metadata.description}
              </li>
            </ul>
          </div>
        )
      )}
    </>
  );
}
