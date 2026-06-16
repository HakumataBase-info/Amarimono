import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Calendar, ChevronLeft } from "lucide-react";
import { getNewsBySlug } from "@/services/news.service";
import { generateSiteMetadata, generateNewsJsonLd } from "@/utils/seo";
import { parseMarkdown } from "@/utils/formatter";
import PageTransition from "@/components/common/PageTransition";

export const revalidate = 60; // キャッシュ60秒

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 動的メタデータ生成
 */
export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    return generateSiteMetadata({
      title: "NEWS NOT FOUND",
      noIndex: true,
    });
  }

  return generateSiteMetadata({
    title: news.title,
    description: news.content.substring(0, 120).replace(/[#*`\n]/g, ""),
    path: `/news/${slug}`,
    ogImage: news.thumbnail,
  });
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  const jsonLd = generateNewsJsonLd(news);
  const parsedContent = parseMarkdown(news.content);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <PageTransition>
      {/* 構造化データの挿入 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
        {/* 背景光彩 */}
        <div className="absolute top-[20%] left-[-15%] w-[400px] h-[400px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-15%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          
          {/* 戻るボタン */}
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            BACK TO NEWS
          </Link>

          {/* ニュースヘッダー */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Calendar size={14} />
              <span>{formatDate(news.createdAt)}</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide text-white leading-normal">
              {news.title}
            </h1>

            <div className="w-16 h-[2px] bg-gradient-to-r from-pink-500 to-cyan-400 mt-2" />
          </div>

          {/* 大型サムネイル */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 mb-12 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
            <Image
              src={news.thumbnail}
              alt={news.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* ニュース本文 */}
          <article
            className="glass-panel p-8 md:p-12 rounded-3xl leading-loose text-slate-300 text-sm md:text-base tracking-wide"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />

        </div>
      </div>
    </PageTransition>
  );
}
