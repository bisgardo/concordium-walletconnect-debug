interface Props {
  unixSecs: number;
}

export default function Expiry({ unixSecs }: Props) {
  return (
    <>
      {new Date(unixSecs * 1000).toISOString()} ({unixSecs})
    </>
  );
}
