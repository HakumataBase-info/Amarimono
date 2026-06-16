"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function MouseFollower() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // マウス座標
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 滑らかな遅延効果（Spring）
  const springConfig = { damping: 40, stiffness: 250, mass: 0.8 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      // 画面のどこかを初めてマウスが動いたときに表示
      if (!isVisible) setIsVisible(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // タッチデバイス判定
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
      window.addEventListener("mousemove", handleMouseMove);
      document.body.addEventListener("mouseleave", handleMouseLeave);
      document.body.addEventListener("mouseenter", handleMouseEnter);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!mounted || !isVisible) return null;

  return (
    <motion.div
      className="mouse-glow"
      style={{
        left: glowX,
        top: glowY,
      }}
    />
  );
}
