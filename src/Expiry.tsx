export default function Expiry({ unixSecs }: { unixSecs: number }) {
  return (
    <>
      {new Date(unixSecs * 1000).toISOString()} ({unixSecs})
    </>
  );
}

