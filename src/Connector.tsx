import { WalletConnectConnector } from "@concordium/wallet-connectors";
import Session from "./Session.tsx";
import Metadata from "./Metadata.tsx";
import { IPairing } from "@walletconnect/types";

interface Props {
  connector: WalletConnectConnector;
}

export default function Connector({ connector }: Props) {
  const { client } = connector;
  return (
    <>
      <h3>Name</h3>
      {client.name}
      <h3>Context</h3>
      {client.context}
      <h3>Client metadata</h3>
      <Metadata metadata={client.metadata} />
      <h3>Pending session requests</h3>
      {client.getPendingSessionRequests().map((req, idx) => (
        <div key={idx}>
          <h4>#{idx}</h4>
          <div>Topic: {req.topic}</div>
          <div>ID: {req.id}</div>
          <div>Params: {JSON.stringify(req.params)}</div>
        </div>
      ))}
      <h3>Sessions</h3>
      {[...client.session.map.entries()].map(([key, session], idx) => (
        <div key={idx}>
          <h4>#{idx}</h4>
          <div>Key: {key}</div>
          <Session session={session} />
        </div>
      ))}
      <h3>Proposals</h3>
      {[...client.proposal.map.entries()].map(([key, proposal], idx) => (
        <div key={idx}>
          <h4>#{idx}</h4>
          <div>Key: {key}</div>
          <div>Proposal ID: {proposal.id}</div>
          <div>Proposer public key: {proposal.proposer.publicKey}</div>
          <div>Proposer metadata:</div>
          <Metadata metadata={proposal.proposer.metadata} />
          <div>Expiry: {proposal.expiry}</div>
          <div>Pairing topic: {proposal.pairingTopic}</div>
        </div>
      ))}
      <h3>Core client pairing</h3>
      <Pairing pairing={client.core.pairing} />
    </>
  );
}

interface PairingProps {
  pairing: IPairing;
}

function Pairing({ pairing }: PairingProps) {
  return (
    <>
      <h3>Pairing: {pairing.name}</h3>
      <div>Context: {pairing.context}</div>
      <div>Pairings:</div>
        {[...pairing.pairings.map.entries()].map(([key, pairing], idx) => (
          <>
              <h4>#{idx}</h4>
            <div>Key: {key}</div>
            <div>Expiry: {pairing.expiry}</div>
            <div>Topic: {pairing.topic}</div>
            <div>Relay:</div>
            {JSON.stringify(pairing.relay)}
            <div>Active: {pairing.active}</div>
            <div>Metadata:</div>
            {pairing.peerMetadata && <Metadata metadata={pairing.peerMetadata} />}
          </>
        ))}
    </>
  );
}
