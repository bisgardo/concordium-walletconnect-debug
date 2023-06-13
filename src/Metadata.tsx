import { CoreTypes } from "@walletconnect/types";

interface Props {
  metadata: CoreTypes.Metadata;
}

export default function Metadata({ metadata }: Props) {
  const { name, url, icons, description } = metadata;
  return (
    <ul>
      <li>Name: {name}</li>
      <li>URL: {url}</li>
      <li>Icons: {icons.join(", ")}</li>
      <li>Description: {description}</li>
    </ul>
  );
}
