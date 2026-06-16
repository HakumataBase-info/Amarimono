import { getAllNews } from "@/services/news.service";
import NewsCard from "@/components/news/NewsCard";
import PageTransition from "@/components/common/PageTransition";
import { generateSiteMetadata } from "@/utils/seo";
import { Metadata } from "next";

export const revalidate = 60; // キャッシュ60秒

export const metadata: Metadata = generateSiteMetadata({
  title: "NEWS 一覧",
  description: "原田ダダスケ主催のストリーマーグループ「余りモノ」の最新情報をお届けするニュース一覧ページ。ハチャメチャなイベント告知やグッズ情報などはこちら！",
  path: "/news",
});

export default async function NewsPage() {
  const allNews = await getAllNews();

  return (
    <PageTransition>
      <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
        {/* 背景光彩 */}
        <div className="absolute top-[30%] right-[-10%] w-[350px] h-[350px] rounded-full bg-pink-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[30%] left-[-10%] w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* ページタイトル */}
          <div className="text-center mb-16 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.3em] text-pink-500 uppercase">
              Latest Info
            </span>
            <h1 className="text-4xl font-extrabold tracking-widest text-white mt-1 uppercase">
              NEWS
            </h1>
            <div className="w-12 h-[2px] bg-gradient-to-r from-pink-500 to-cyan-400 mt-4" />
          </div>

          {/* ニュースグリッド */}
          {allNews.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              ニュースがありません。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allNews.map((news, idx) => (
                <NewsCard key={news.id} news={news} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
