"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loginAdmin } from "../actions";
import { Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("パスワードを入力してください。");
      return;
    }

    startTransition(async () => {
      try {
        const result = await loginAdmin(password);
        if (result.success) {
          router.push("/admin-portal");
          router.refresh();
        } else {
          setError(result.error || "認証に失敗しました。");
        }
      } catch (err) {
        setError("通信エラーが発生しました。");
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center relative py-12 px-4 sm:px-6 lg:px-8">
      {/* 背景光彩デコレーション */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-pink-500/5 blur-[80px] pointer-events-none z-0" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* ロゴとタイトル */}
        <div className="text-center flex flex-col items-center">
          <div className="relative w-48 h-24 mb-6">
            <Image
              src="/logo.png"
              alt="余りモノ"
              fill
              className="object-contain filter drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              priority
            />
          </div>
          <h2 className="text-2xl font-extrabold tracking-widest text-white">
            ADMIN PORTAL
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            メンバー及びニュースの管理システム
          </p>
        </div>

        {/* ログインフォームカード */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">
                ADMIN PASSWORD
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg bg-black/40 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all text-sm"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ボタン */}
            <div>
              <button
                type="submit"
                disabled={isPending}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-pink-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.01] active:scale-[0.99] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                    認証中...
                  </span>
                ) : (
                  "ログイン"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
