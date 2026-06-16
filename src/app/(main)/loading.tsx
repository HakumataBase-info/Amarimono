export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col justify-center items-center gap-4">
      {/* ネオン回転ローダー */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-pink-500 animate-spin" />
      </div>
      <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500 animate-pulse">
        Syncing...
      </span>
    </div>
  );
}
