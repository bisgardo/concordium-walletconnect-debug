import { SessionTypes } from "@walletconnect/types";
import Metadata from "./Metadata.tsx";

interface Props {
  session: SessionTypes.Struct;
}

export default function Session({ session }: Props) {
  return (
    <ul>
      <li>Topic: {session.topic}</li>
      <li>Relay protocol: {session.relay.protocol}</li>
      <li>Relay data: {session.relay.data ?? <i>None</i>}</li>
      <li>Expiry: {session.expiry}</li>
      <li>Acknowledged: {session.acknowledged.toString()}</li>
      <li>Controller: {session.controller}</li>
      <li>
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
      </li>
      <li>
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
      </li>
      <li>Self public key: {session.self.publicKey}</li>
      <li>
        Self metadata: <Metadata metadata={session.self.metadata} />
      </li>
      <li>Peer public key: {session.peer.publicKey}</li>
      <li>
        Peer metadata: <Metadata metadata={session.peer.metadata} />
      </li>
    </ul>
  );
}
