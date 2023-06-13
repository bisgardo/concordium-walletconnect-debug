import { WalletConnectConnection } from "@concordium/wallet-connectors";
import {useCallback} from "react";

interface Props {
  connection: WalletConnectConnection;
  account: string | undefined;
  chain: string | undefined;
}

export default function Connection({ connection, account, chain }: Props) {
  const disconnect = useCallback(
      () => connection.disconnect().catch(console.error),
      [connection]
  )
  return (
    <>
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
              Object.entries(connection.session.namespaces).map(([key, ns]) => (
                <li key={key}>
                  <div>Key: {key}</div>
                  <div>Accounts: {ns.accounts.join(", ")}</div>
                  <div>Methods: {ns.methods.join(", ")}</div>
                  <div>Events: {ns.events.join(", ")}</div>
                </li>
              ))}
          </ul>
        </li>
        <li>
          Required namespaces:
          <ul>
            {connection.session.requiredNamespaces &&
              Object.entries(connection.session.requiredNamespaces).map(([key, ns]) => (
                <li key={key}>
                  <div>Key: {key}</div>
                  <div>Chains: {ns.chains?.join(", ") || "N/A"}</div>
                  <div>Methods: {ns.methods.join(", ")}</div>
                  <div>Events: {ns.events.join(", ")}</div>
                </li>
              ))}
          </ul>
        </li>
        <li>Self public key: {connection.session.self.publicKey}</li>
        <li>Self metadata name: {connection.session.self.metadata.name}</li>
        <li>Self metadata url: {connection.session.self.metadata.url}</li>
        <li>Self metadata icons: {connection.session.self.metadata.icons.join(", ")}</li>
        <li>Self metadata description: {connection.session.self.metadata.description}</li>
        <li>Peer public key: {connection.session.peer.publicKey}</li>
        <li>Peer metadata name: {connection.session.peer.metadata.name}</li>
        <li>Peer metadata url: {connection.session.peer.metadata.url}</li>
        <li>Peer metadata icons: {connection.session.peer.metadata.icons.join(", ")}</li>
        <li>Peer metadata description: {connection.session.peer.metadata.description}</li>
      </ul>
      <div>
        <button className="btn btn-danger" onClick={disconnect}>Disconnect</button>
      </div>
    </>
  );
}
