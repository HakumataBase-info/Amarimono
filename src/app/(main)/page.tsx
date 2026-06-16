import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getLatestNews } from "@/services/news.service";
import { getMembers } from "@/services/member.service";
import NewsCard from "@/components/news/NewsCard";
import MemberCard from "@/components/member/MemberCard";
import ScrollDown from "@/components/common/ScrollDown";

// クライアント側のアニメーション装飾用ラッパー
import PageTransition from "@/components/common/PageTransition";

export const revalidate = 60; // 60秒キャッシュ

export default async function HomePage() {
  // サーバーサイドでのデータフェッチ
  const [latestNews, members] = await Promise.all([
    getLatestNews(3),
    getMembers(),
  ]);

  return (
    <PageTransition>
      <div className="relative w-full">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
          {/* 背景のネオングラデーションとノイズエフェクト */}
          <div className="absolute inset-0 bg-[#060608] z-0">
            {/* カラフルなぼかし光彩 */}
            <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
            
            {/* グリッド背景 */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          </div>

          {/* メインコンテンツ */}
          <div className="relative z-10 text-center flex flex-col items-center gap-6 px-6 max-w-4xl">
            {/* グループ名 & 読み */}
            <span className="text-xs font-bold tracking-[0.4em] text-slate-500 uppercase">
              STREAMER GROUP
            </span>

            {/* ロゴの表示 */}
            <div className="relative w-72 h-40 md:w-96 md:h-52 animate-bounce" style={{ animationDuration: '6s' }}>
              <Image
                src="/logo.png"
                alt="余りモノ"
                fill
                className="object-contain filter drop-shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                priority
              />
            </div>

            {/* キャッチコピー */}
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-[0.15em] text-white">
              余りモノには、
              <span className="text-neon-gradient cyber-glitch-text block md:inline">
                福がある。
              </span>
            </h1>

            <p className="text-xs md:text-sm text-slate-400 max-w-lg leading-relaxed mt-2 tracking-wider">
              ネットの片隅に佇む、はみ出たモノたち。<br />
              余っているわけじゃない、俺らがメインだ。
            </p>

            {/* CTAボタン */}
            <div className="mt-8 flex items-center gap-4 flex-col sm:flex-row">
              <Link
                href="/member"
                className="px-8 py-3 rounded-full font-bold text-xs tracking-widest text-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-pink-500 hover:scale-105 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 uppercase"
              >
                View Members
              </Link>
              <Link
                href="/news"
                className="px-8 py-3 rounded-full font-bold text-xs tracking-widest text-white border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all duration-300 uppercase"
              >
                Latest News
              </Link>
            </div>
          </div>

          {/* Scroll Down */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
            <ScrollDown />
          </div>
        </section>

        {/* ================= GROUP INTRO ================= */}
        <section className="relative py-24 bg-[#08080c] border-y border-white/5 overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 flex flex-col items-center gap-6">
            <span className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase">
              Concept
            </span>
            <h2 className="text-3xl font-extrabold tracking-widest text-white">
              「余りモノ」とは
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-loose max-w-2xl mt-4">
              原田ダダスケ主催のストリーマーグループ。<br />
              彼らが集まったとき、かつてないハチャメチャが始まる。<br />
              <br />
              ゲーム実況、esports、音楽、ストリートカルチャー。<br />
              余ったモノたちから生まれる、本気の熱狂をあなたに。
            </p>
          </div>
        </section>

        {/* ================= LATEST NEWS ================= */}
        <section className="py-24 max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-pink-500 uppercase">
                What&apos;s New
              </span>
              <h2 className="text-3xl font-extrabold tracking-widest text-white mt-1">
                LATEST NEWS
              </h2>
            </div>
            <Link
              href="/news"
              className="text-xs font-bold text-white/50 hover:text-white flex items-center gap-1 group transition-colors"
            >
              MORE NEWS <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNews.map((news, idx) => (
              <NewsCard key={news.id} news={news} index={idx} />
            ))}
          </div>
        </section>

        {/* ================= MEMBERS PREVIEW ================= */}
        <section className="py-24 bg-[#050507] relative overflow-hidden">
          {/* 背景光彩 */}
          <div className="absolute right-0 top-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
              <div>
                <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-400 uppercase">
                  Our Team
                </span>
                <h2 className="text-3xl font-extrabold tracking-widest text-white mt-1">
                  MEMBERS
                </h2>
              </div>
              <Link
                href="/member"
                className="text-xs font-bold text-white/50 hover:text-white flex items-center gap-1 group transition-colors"
              >
                ALL MEMBERS <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
}
