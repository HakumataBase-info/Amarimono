"use client";

import Link from "next/link";
import SafeImage from "@/components/common/SafeImage";
import { motion } from "framer-motion";
import { Youtube, Twitter, Instagram } from "lucide-react";
import { MemberSummary } from "@/types";

interface MemberCardProps {
  member: MemberSummary;
}

export default function MemberCard({ member }: MemberCardProps) {
  // メンバーカラーをHEXからRGBの半透明に変換するヘルパー（背景光彩用）
  const getGlowStyle = (color: string) => {
    return {
      background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      {/* メンバーカラーのホバー背景光彩 */}
      <div
        className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none z-0"
        style={getGlowStyle(member.color)}
      />

      {/* メインカード */}
      <Link
        href={`/member/${member.slug}`}
        className="relative block z-10 glass-panel rounded-2xl overflow-hidden transition-all duration-500 group-hover:translate-y-[-8px] group-hover:border-white/20 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
      >
        {/* 画像エリア */}
        <div className="relative aspect-square w-full overflow-hidden bg-black/40">
          <SafeImage
            src={member.iconImage}
            alt={member.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[0.16, 1, 0.3, 1] group-hover:scale-105"
            loading="lazy"
          />
          {/* オーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-transparent to-transparent opacity-60" />
          
          {/* メンバーカラーのアクセントライン */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px]"
            style={{ backgroundColor: member.color }}
          />
        </div>

        {/* テキストコンテンツ */}
        <div className="p-6">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">
            {member.reading}
          </span>
          <h3 className="text-xl font-bold tracking-wide mt-1 text-transparent bg-clip-text transition-all duration-300"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${member.color} 100%)`,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.9))"
              }}>
            {member.name}
          </h3>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 min-h-[32px] leading-relaxed">
            {member.description}
          </p>

          {/* 好きなゲームタグ */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {member.favoriteGame.split(",").slice(0, 2).map((game) => (
              <span
                key={game}
                className="text-[9px] font-semibold tracking-wider bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-300"
              >
                {game.trim()}
              </span>
            ))}
          </div>

          {/* SNSリンク (カードをクリックしても遷移させないようにstopPropagation) */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-4 relative z-20">
            {member.youtube && (
              <a
                href={member.youtube}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-white/40 hover:text-[#ff0000] transition-colors p-1"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            )}
            {member.twitch && (
              <a
                href={member.twitch}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-white/40 hover:text-[#9146ff] transition-colors p-1"
                aria-label="Twitch"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
              </a>
            )}
            {member.twitter && (
              <a
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-white/40 hover:text-white transition-colors p-1"
                aria-label="X (Twitter)"
              >
                <Twitter size={16} />
              </a>
            )}
            {member.instagram && (
              <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-white/40 hover:text-[#e1306c] transition-colors p-1"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
