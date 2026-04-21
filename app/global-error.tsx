'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
        <h2>Application error</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
        <button onClick={() => reset()} style={{ marginTop: 12 }}>
          Try again
        </button>
      </body>
    </html>
  );
}
