import { EngineTypes, ISignClient } from "@walletconnect/types";
import QRCodeModal from "@walletconnect/qrcode-modal";

export async function connectWallet(client: ISignClient, params: EngineTypes.ConnectParams, cancel: () => void) {
  try {
    // If we passed the topic of an existing pairing, then 'uri' would be undefined.
    const { uri, approval } = await client.connect(params);
    if (uri) {
      // Open modal as we're not connecting to an existing pairing.
      QRCodeModal.open(uri, cancel);
    }
    return await approval();
  } finally {
    QRCodeModal.close();
  }
}
