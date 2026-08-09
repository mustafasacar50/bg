"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">React Çökme Hatası!</h2>
      <p className="text-slate-600 mb-4">Gösterge paneli yüklenirken teknik bir sorun meydana geldi.</p>
      <div className="bg-red-50 p-4 rounded-lg text-left w-full max-w-lg mb-6 overflow-auto">
        <p className="text-sm font-mono text-red-800">{error.message}</p>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => reset()}
      >
        Tekrar Dene
      </button>
    </div>
  );
}
