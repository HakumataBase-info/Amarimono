"use client";

import { motion } from "framer-motion";

export default function ScrollDown() {
  return (
    <div className="flex flex-col items-center gap-2 select-none cursor-pointer" onClick={() => {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth"
      });
    }}>
      <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/40">Scroll Down</span>
      <div className="w-[24px] h-[36px] rounded-full border-2 border-white/20 flex justify-center p-1.5 relative overflow-hidden">
        <motion.div
          animate={{
            y: [0, 12, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-1.5 h-1.5 rounded-full bg-gradient-to-b from-cyan-400 to-pink-500"
        />
      </div>
    </div>
  );
}
