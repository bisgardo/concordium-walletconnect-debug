import { SessionTypes } from "@walletconnect/types";
import { Card } from "react-bootstrap";
import Metadata from "./Metadata.tsx";

interface Props {
  session: SessionTypes.Struct;
}

export default function Session({ session }: Props) {
  return (
    <>
      <Card.Text>Topic: {session.topic}</Card.Text>
      <Card.Text>Relay protocol: {session.relay.protocol}</Card.Text>
      <Card.Text>Relay data: {session.relay.data ?? <i>None</i>}</Card.Text>
      <Card.Text>Expiry: {session.expiry}</Card.Text>
      <Card.Text>Acknowledged: {session.acknowledged.toString()}</Card.Text>
      <Card.Text>Controller: {session.controller}</Card.Text>
      Namespaces:
      <ul>
        {session.namespaces &&
          Object.entries(session.namespaces).map(([key, ns]) => (
            <li key={key}>
              <div>Key: {key}</div>
              <div>Accounts: {ns.accounts.join(", ")}</div>
              <div>Methods: {ns.methods.join(", ")}</div>
              <div>Events: {ns.events.join(", ")}</div>
            </li>
          ))}
      </ul>
      Required namespaces:
      <ul>
        {session.requiredNamespaces &&
          Object.entries(session.requiredNamespaces).map(([key, ns]) => (
            <li key={key}>
              <div>Key: {key}</div>
              <div>Chains: {ns.chains?.join(", ") ?? <i>None</i>}</div>
              <div>Methods: {ns.methods.join(", ")}</div>
              <div>Events: {ns.events.join(", ")}</div>
            </li>
          ))}
      </ul>
      <Card.Text>Self public key: {session.self.publicKey}</Card.Text>
      Self metadata:
      <Metadata metadata={session.self.metadata} />
      <Card.Text>Peer public key: {session.peer.publicKey}</Card.Text>
      <Card.Text>Peer metadata:</Card.Text>
      <Metadata metadata={session.peer.metadata} />
    </>
  );
}
