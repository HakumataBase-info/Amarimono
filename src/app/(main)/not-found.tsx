import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center items-center text-center overflow-hidden px-6">
      {/* 背景光彩 */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">
        {/* ロゴ */}
        <div className="relative w-40 h-24 mb-4">
          <Image
            src="/logo.png"
            alt="余りモノ ロゴ"
            fill
            className="object-contain filter grayscale opacity-40"
          />
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-400 to-pink-500 animate-pulse">
          404
        </h1>

        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-extrabold tracking-widest text-white uppercase">
            PAGE NOT FOUND
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">
            お探しのページは削除されたか、URLが変更された可能性があります。<br />
            または、余剰スペースに吸い込まれたかもしれません。
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 px-8 py-3 rounded-full font-bold text-xs tracking-widest text-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-pink-500 hover:scale-105 transition-all duration-300 uppercase"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
