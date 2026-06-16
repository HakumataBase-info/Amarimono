"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Gallery } from "@prisma/client";

interface GallerySliderProps {
  gallery: Gallery[];
}

export default function GallerySlider({ gallery }: GallerySliderProps) {
  const [index, setIndex] = useState<number | null>(null);

  if (gallery.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === null) return;
    setIndex(index === 0 ? gallery.length - 1 : index - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === null) return;
    setIndex(index === gallery.length - 1 ? 0 : index + 1);
  };

  return (
    <div>
      {/* グリッドレイアウト */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {gallery.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            onClick={() => setIndex(idx)}
            className="relative aspect-[16/10] rounded-xl overflow-hidden border border-white/5 cursor-pointer group glass-panel-hover"
          >
            <Image
              src={item.image}
              alt={`Gallery Image ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* ホバー時のオーバーレイと拡大サイン */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-xs font-semibold tracking-widest text-white border border-white/20 bg-black/40 px-3 py-1.5 rounded-full uppercase">
                View Image
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ライトボックス / 拡大モーダル */}
      <AnimatePresence>
        {index !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIndex(null)}
            className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4"
          >
            {/* 閉じるボタン */}
            <button
              onClick={() => setIndex(null)}
              className="absolute top-6 right-6 text-white/60 hover:text-white bg-white/5 border border-white/10 p-2.5 rounded-full cursor-pointer transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* ナビゲーション（前へ） */}
            <button
              onClick={handlePrev}
              className="absolute left-6 text-white/60 hover:text-white bg-white/5 border border-white/10 p-2.5 rounded-full cursor-pointer transition-colors hidden sm:block"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            {/* ナビゲーション（次へ） */}
            <button
              onClick={handleNext}
              className="absolute right-6 text-white/60 hover:text-white bg-white/5 border border-white/10 p-2.5 rounded-full cursor-pointer transition-colors hidden sm:block"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>

            {/* 画像表示 */}
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full aspect-[16/10] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={gallery[index].image}
                alt={`Gallery Large ${index + 1}`}
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
