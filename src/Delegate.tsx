import {
  WalletConnectConnection,
  WalletConnectionDelegate,
} from "@concordium/wallet-connectors";
import React from "react";

interface Props {
  children: (props: ConnectionsProps) => React.ReactElement;
}

interface ConnectionData {
  account: string | undefined;
  chain: string | undefined;
}
interface State {
  connections: Map<WalletConnectConnection, ConnectionData>;
}

export interface ConnectionsProps extends State {
  delegate: Delegate;
}

export default class Delegate
  extends React.Component<Props, State>
  implements WalletConnectionDelegate
{
  constructor(props: Props) {
    super(props);
    this.state = {
      connections: new Map<WalletConnectConnection, ConnectionData>(),
    };
  }

  onAccountChanged = (
    connection: WalletConnectConnection,
    address: string | undefined
  ) => {
    console.debug("onChainChanged", { connection, address });
    this.setState((state) => {
      const data = state.connections.get(connection);
      if (!data) {
        throw new Error(`no data found for connection ${connection}`);
      }
      const connections = new Map(state.connections);
      connections.set(connection, { ...data, account: address });
      return { ...state, connections: connections };
    });
  };

  onChainChanged = (
    connection: WalletConnectConnection,
    genesisHash: string
  ) => {
    console.debug("onChainChanged", { connection, genesisHash });
    this.setState((state) => {
      const data = state.connections.get(connection);
      if (!data) {
        throw new Error(`no data found for connection ${connection}`);
      }
      const connections = new Map(state.connections);
      connections.set(connection, { ...data, chain: genesisHash });
      return { ...state, connections: connections };
    });
  };

  onConnected = (
    connection: WalletConnectConnection,
    address: string | undefined
  ) => {
    console.debug("onConnected", { connection, address });
    this.setState((state) => {
      const connections = new Map(state.connections);
      connections.set(connection, { account: address, chain: undefined });
      return { ...state, connections: connections };
    });
  };

  onDisconnected = (connection: WalletConnectConnection) => {
    console.debug("onDisconnected", { connection });
    this.setState((state) => {
      const connections = new Map(state.connections);
      connections.delete(connection);
      return { ...state, connections: connections };
    });
  };

  render() {
    return this.props.children({ ...this.state, delegate: this });
  }
}
