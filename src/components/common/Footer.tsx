"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#040406] border-t border-white/5 py-12 overflow-hidden">
      {/* 背景の薄いグラデーション光彩 */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[150px] rounded-full bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 via-yellow-500/5 to-pink-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* 左側: ロゴと説明 */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 max-w-sm">
          <Link href="/" className="relative w-32 h-14 block">
            <Image
              src="/logo.png"
              alt="余りモノ ロゴ"
              fill
              className="object-contain"
            />
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed">
            原田ダダスケ主催のストリーマーグループ「余りモノ」の公式ポータル。余っているわけじゃない、俺らがメインだ。
          </p>
        </div>

        {/* 右側: コピーライト */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex items-center gap-4 text-[10px] text-slate-600">
            <span>© {new Date().getFullYear()} 余りモノ. All Rights Reserved.</span>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Scroll to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
