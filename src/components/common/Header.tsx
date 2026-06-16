"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "TOP", href: "/" },
  { label: "MEMBER", href: "/member" },
  { label: "NEWS", href: "/news" },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ページ移動時にモバイルメニューを閉じる
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(false);
    }
  }, [pathname, isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-black/60 backdrop-blur-md border-b border-white/5"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* ロゴエリア */}
        <Link href="/" className="relative w-28 h-12 block transition-transform duration-300 hover:scale-105">
          <Image
            src="/logo.png"
            alt="余りモノ ロゴ"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* デスクトップ ナビゲーション */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm font-semibold tracking-wider text-white/75 hover:text-white transition-colors duration-300 py-1"
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-pink-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* モバイルメニューボタン */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white/80 hover:text-white transition-colors p-1"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* モバイル ナビゲーション */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed top-[69px] left-0 right-0 bottom-0 bg-[#060608]/95 backdrop-blur-lg z-40 flex flex-col justify-center items-center gap-8 px-6"
          >
            {/* 背景装飾 */}
            <div className="absolute w-[250px] h-[250px] rounded-full bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-pink-500/10 blur-3xl opacity-40 pointer-events-none" />

            {navItems.map((item, idx) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.href}
                >
                  <Link
                    href={item.href}
                    className={`text-2xl font-bold tracking-widest ${
                      isActive ? "text-neon-gradient cyber-glitch-text" : "text-white/70 hover:text-white"
                    } transition-colors duration-300 block py-2`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
