import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PORTAL ADMIN",
  description: "余りモノ管理ポータル",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#08080c] text-white flex flex-col justify-start relative overflow-hidden font-sans">
      {/* 管理画面の背景装飾 */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-pink-500/5 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-7xl mx-auto p-6 flex-grow relative z-10">
        {children}
      </div>
    </div>
  );
}
