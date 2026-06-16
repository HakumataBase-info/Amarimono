"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("System Error caught:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[70vh] flex flex-col justify-center items-center gap-6 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
        <AlertCircle size={32} />
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <h2 className="text-xl font-extrabold tracking-widest text-white uppercase">
          SYSTEM ERROR
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed mt-2">
          予期せぬエラーが発生しました。一時的な問題の可能性があります。接続を確認し、もう一度お試しください。
        </p>
      </div>

      <button
        onClick={() => reset()}
        className="px-8 py-3 rounded-full font-bold text-xs tracking-widest text-black bg-gradient-to-r from-emerald-400 to-cyan-400 hover:scale-105 transition-all cursor-pointer"
      >
        RETRY CONNECTION
      </button>
    </div>
  );
}
