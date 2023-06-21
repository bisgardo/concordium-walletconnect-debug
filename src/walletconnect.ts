import { ISignClient } from "@walletconnect/types";
import QRCodeModal from "@walletconnect/qrcode-modal";

export async function connect(client: ISignClient, chainId: string, cancel: () => void) {
  try {
    // If we passed the topic of an existing pairing, then 'uri' would be undefined.
    const { uri, approval } = await client.connect({
      requiredNamespaces: {
        ccd: {
          methods: ["sign_and_send_transaction", "sign_message"],
          chains: [chainId],
          events: ["chain_changed", "accounts_changed"],
        },
      },
    });
    if (uri) {
      // Open modal as we're not connecting to an existing pairing.
      QRCodeModal.open(uri, cancel);
    }
    return await approval();
  } catch (e) {
    // Ignore falsy errors.
    if (e) {
      console.error(`WalletConnect client error: ${e}`);
    }
    cancel();
  } finally {
    QRCodeModal.close();
  }
}
