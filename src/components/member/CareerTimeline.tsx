"use client";

import { motion } from "framer-motion";
import { CareerItem } from "@/types";

interface CareerTimelineProps {
  careerJson: string;
  memberColor: string;
}

export default function CareerTimeline({ careerJson, memberColor }: CareerTimelineProps) {
  let items: CareerItem[] = [];
  try {
    items = JSON.parse(careerJson);
  } catch (e) {
    console.error("Failed to parse career JSON", e);
    return null;
  }

  if (items.length === 0) return null;

  return (
    <div className="relative border-l border-white/10 pl-6 ml-4 space-y-8 py-2">
      {/* タイムラインのネオンライン装飾 */}
      <div
        className="absolute top-0 bottom-0 left-[-1.5px] w-[3px]"
        style={{
          background: `linear-gradient(to bottom, ${memberColor}, ${memberColor}33 80%, transparent 100%)`,
          boxShadow: `0 0 10px ${memberColor}66`
        }}
      />

      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="relative"
        >
          {/* タイムラインの交点丸ドット */}
          <div
            className="absolute left-[-32.5px] top-1.5 w-4.5 h-4.5 rounded-full border-2 bg-[#060608] z-10 flex items-center justify-center"
            style={{ borderColor: memberColor }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: memberColor }}
            />
          </div>

          <span
            className="text-xs font-bold tracking-widest"
            style={{ color: memberColor }}
          >
            {item.date}
          </span>
          <h4 className="text-base font-bold text-white mt-1 tracking-wide">
            {item.title}
          </h4>
        </motion.div>
      ))}
    </div>
  );
}
