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

export const revalidate = 86400; // 24時間キャッシュ

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
            <div className="relative w-72 h-40 md:w-96 md:h-52 animate-float mx-auto">
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
              <span className="inline-block">ネットの片隅に佇む、</span><span className="inline-block">はみ出たモノたち。</span><br />
              <span className="inline-block">余っているわけじゃない、</span><span className="inline-block">俺らがメインだ。</span>
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
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:block">
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
              <span className="inline-block">原田ダダスケ主催の</span><span className="inline-block">ストリーマーグループ。</span><br />
              <span className="inline-block">彼らが集まったとき、</span><span className="inline-block">かつてないハチャメチャが始まる。</span><br />
              <br />
              <span className="inline-block">ゲーム実況、</span><span className="inline-block">esports、</span><span className="inline-block">音楽、</span><span className="inline-block">ストリートカルチャー。</span><br />
              <span className="inline-block">余ったモノたちから生まれる、</span><span className="inline-block">本気の熱狂をあなたに。</span>
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

            {/* 新規募集セクション */}
            <div className="mt-16 max-w-3xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-r from-black/80 to-[#0b0b12] p-8 md:p-10 text-center">
                {/* 背景ネオン光彩 */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-40 -z-10" />
                
                <span className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase block mb-3">
                  RECRUITMENT
                </span>
                
                <h3 className="text-xl md:text-2xl font-extrabold tracking-wider text-white mb-3">
                  新規メンバー・配信者 募集中！
                </h3>
                
                <p className="text-xs md:text-sm text-slate-400 mb-6 max-w-lg mx-auto leading-relaxed">
                  「余りモノ」では、共に熱狂を作り上げる仲間を募集しています。<br />
                  配信初心者、プロ、ジャンル問わず、<strong className="text-emerald-400">誰でも参加可能</strong>です。まずはお気軽にご参加ください！
                </p>

                <a
                  href="https://discord.gg/KucKhg8P4q"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-3 rounded-full font-bold text-xs tracking-widest text-white bg-[#5865F2] hover:bg-[#4752C4] hover:scale-105 hover:shadow-[0_0_20px_rgba(88,101,242,0.4)] transition-all duration-300 uppercase"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.196.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                  </svg>
                  Discordで参加する
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
}
