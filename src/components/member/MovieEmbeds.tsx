"use client";

import { motion } from "framer-motion";
import { Movie } from "@prisma/client";

interface MovieEmbedsProps {
  movies: Movie[];
  memberColor: string;
}

export default function MovieEmbeds({ movies, memberColor }: MovieEmbedsProps) {
  if (movies.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {movies.map((movie, idx) => (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="flex flex-col gap-3 group"
        >
          {/* iframe ラッパー (16:9比率) */}
          <div
            className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/5 glass-panel transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.02)]"
            style={{
              boxShadow: `0 0 0px ${memberColor}00`,
            }}
          >
            {/* YouTube 埋め込み */}
            <iframe
              src={`https://www.youtube.com/embed/${movie.youtubeId}?rel=0`}
              title={movie.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          {/* 動画タイトル */}
          <div>
            <h4 className="text-sm font-semibold text-white/90 line-clamp-2 leading-relaxed tracking-wide group-hover:text-white transition-colors duration-300">
              {movie.title}
            </h4>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
