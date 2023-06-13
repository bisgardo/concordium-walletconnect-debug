import { WalletConnectConnection } from "@concordium/wallet-connectors";
import { useCallback } from "react";
import Session from "./Session.tsx";

interface Props {
  connection: WalletConnectConnection;
  account: string | undefined;
  chain: string | undefined;
}

export default function Connection({ connection, account, chain }: Props) {
  const disconnect = useCallback(() => connection.disconnect().catch(console.error), [connection]);
  return (
    <>
      <h4>Account</h4>
      {account}
      <h4>Chain</h4>
      {chain}
      <h4>Session</h4>
      <Session session={connection.session} />
      <div>
        <button className="btn btn-danger" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    </>
  );
}
