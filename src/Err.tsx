interface Props {
  err: unknown;
}

export default function Err({ err }: Props) {
  return err instanceof Error ? err.message || err.stack : JSON.stringify(err, null, 2);
}
