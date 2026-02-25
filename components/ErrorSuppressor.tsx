"use client";

import { useEffect } from "react";

/**
 * Suppresses AbortError messages that occur during React Strict Mode remounts.
 * These errors are harmless and only occur in development mode.
 */
export function ErrorSuppressor() {
  useEffect(() => {
    // Store originals
    const originalError = console.error;
    const originalWarn = console.warn;

    // Helper to check if it's an abort-related error
    const isAbortError = (args: unknown[]) => {
      return args.some(arg => {
        if (arg instanceof Error && arg.name === 'AbortError') return true;
        if (arg instanceof DOMException && arg.name === 'AbortError') return true;
        if (typeof arg === 'string' && (
          arg.includes('AbortError') || 
          arg.includes('signal is aborted') ||
          arg.includes('aborted without reason')
        )) return true;
        if (arg && typeof arg === 'object' && 'name' in arg && (arg as {name: string}).name === 'AbortError') return true;
        return false;
      });
    };

    // Override console.error
    console.error = (...args) => {
      if (isAbortError(args)) return;
      originalError.apply(console, args);
    };

    // Override console.warn  
    console.warn = (...args) => {
      if (isAbortError(args)) return;
      originalWarn.apply(console, args);
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason instanceof Error && reason.name === 'AbortError') {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (reason instanceof DOMException && reason.name === 'AbortError') {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (reason?.message?.includes('signal is aborted') || reason?.message?.includes('aborted without reason')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    };

    // Handle error events
    const handleError = (event: ErrorEvent) => {
      if (event.error?.name === 'AbortError') {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (event.message?.includes('signal is aborted') || event.message?.includes('AbortError')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    };

    // Add listeners with capture phase to catch errors early
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    window.addEventListener('error', handleError, true);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      window.removeEventListener('error', handleError, true);
    };
  }, []);

  return null;
}
