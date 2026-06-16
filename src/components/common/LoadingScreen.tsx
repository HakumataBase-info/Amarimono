"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // すでにロード済みの場合は表示しない (セッション中1回のみ)
    const hasLoaded = sessionStorage.getItem("hasLoaded");
    if (hasLoaded === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            sessionStorage.setItem("hasLoaded", "true");
          }, 600); // 100%になってから少しディレイを置く
          return 100;
        }
        // ポップな不均一カウンター
        const increment = Math.floor(Math.random() * 8) + 2;
        return Math.min(prev + increment, 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-[#060608] z-[99999] flex flex-col items-center justify-center"
          exit={{
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
        >
          {/* 背景のカラフルブラー光彩 */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-pink-500/20 blur-3xl opacity-50 pointer-events-none" />

          {/* ロゴのふわっと浮き上がるアニメーション */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-64 h-36 mb-8"
          >
            <Image
              src="/logo.png"
              alt="余りモノ ロゴ"
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          {/* プログレスバー & カウンター */}
          <div className="w-48 flex flex-col items-center gap-2">
            <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 via-yellow-400 to-pink-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold tracking-widest text-white/50">
              LOADING <span className="text-white ml-1">{progress}%</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
