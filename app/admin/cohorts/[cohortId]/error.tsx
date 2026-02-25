"use client";

import { useEffect } from "react";

export default function CohortError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Silently log non-abort errors
    if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
      console.error("Cohort page error:", error);
    }
  }, [error]);

  // Silently ignore AbortError - it's harmless and happens during navigation
  if (error?.name === 'AbortError' || error?.message?.includes('signal is aborted')) {
    // Just reset the error boundary without showing anything
    reset();
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error?.message || "Failed to load cohort details."}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-[#0D3B7D] text-white rounded-lg hover:bg-[#0D3B7D]/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
