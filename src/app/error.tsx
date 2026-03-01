'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-of-light px-6">
      <h2 className="text-3xl font-bold text-of-dark mb-4 uppercase tracking-tight">Something went wrong!</h2>
      <p className="text-of-gray mb-8 text-center max-w-md font-medium">
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>
      <button
        onClick={() => reset()}
        className="bg-primary text-white px-10 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-primary-hover transition shadow-lg shadow-primary/20"
      >
        Try again
      </button>
    </div>
  );
}
