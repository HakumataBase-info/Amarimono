"use client";

import Link from "next/link";
import SafeImage from "@/components/common/SafeImage";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { News } from "@/types";

interface NewsCardProps {
  news: News;
  index?: number;
}

export default function NewsCard({ news, index = 0 }: NewsCardProps) {
  // 日付のフォーマットユーティリティ
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative"
    >
      {/* ホバー時のネオン枠線エフェクト */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-pink-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-[2px] z-0 pointer-events-none" />

      {/* メインカードリンク */}
      <Link
        href={`/news/${news.slug}`}
        className="relative block z-10 glass-panel rounded-2xl overflow-hidden transition-all duration-300 group-hover:translate-y-[-4px] group-hover:bg-[#0a0a0e]"
      >
        {/* サムネイル画像 */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/30">
          <SafeImage
            src={news.thumbnail}
            alt={news.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* ニュース情報 */}
        <div className="p-5 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <Calendar size={12} />
            <span>{formatDate(news.createdAt)}</span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug line-clamp-2 mt-1 group-hover:text-cyan-300 transition-colors duration-300 tracking-wide">
            {news.title}
          </h3>

          <span className="text-[10px] font-bold self-start mt-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-400 group-hover:bg-gradient-to-r group-hover:from-emerald-500/10 group-hover:to-cyan-500/10 group-hover:border-cyan-500/20 group-hover:text-cyan-300 transition-all duration-300 uppercase tracking-widest">
            Info
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
