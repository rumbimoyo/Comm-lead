"use client";

import { useEffect } from "react";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Global error handler to suppress AbortError
    const handleError = (event: ErrorEvent) => {
      if (event.error?.name === 'AbortError' || 
          event.message?.includes('AbortError') ||
          event.message?.includes('signal is aborted')) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.name === 'AbortError' || 
          String(event.reason).includes('AbortError') ||
          String(event.reason).includes('signal is aborted')) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);

  return <>{children}</>;
}
