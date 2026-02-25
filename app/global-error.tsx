"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Silently ignore AbortError - it's harmless
  if (error?.name === 'AbortError' || error?.message?.includes('signal is aborted')) {
    return null;
  }

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-6">{error?.message || "An unexpected error occurred."}</p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-[#0D3B7D] text-white rounded-lg hover:bg-[#0D3B7D]/90 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
