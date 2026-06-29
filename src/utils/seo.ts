import { Metadata } from "next";

const SITE_NAME = "「余りモノ」公式ホームページ";
const SITE_DESCRIPTION = "ゲーム配信者グループ「余りモノ」の公式ホームページ。メンバー情報、最新ニュース、ギャラリー、動画配信情報などをお届けします。";

const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // Vercelが自動提供する環境変数 (例: amarimono-chi.vercel.app)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://amarimono-chi.vercel.app";
};

const SITE_URL = getSiteUrl();

interface SeoOptions {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * 共通メタデータを生成するヘルパー
 */
export function generateSiteMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "",
  ogImage = "/logo.png",
  noIndex = false,
}: SeoOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

/**
 * メンバー用 JSON-LD (ProfilePage Schema)
 */
export function generateMemberJsonLd(member: {
  name: string;
  reading: string;
  slug: string;
  description: string;
  iconImage: string;
  youtube?: string | null;
  twitch?: string | null;
  twitter?: string | null;
}) {
  const memberUrl = `${SITE_URL}/member/${member.slug}`;
  const sameAs = [member.youtube, member.twitch, member.twitter].filter(Boolean) as string[];

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": member.name,
      "alternateName": member.reading,
      "description": member.description,
      "image": member.iconImage,
      "url": memberUrl,
      "sameAs": sameAs,
    },
  };
}

/**
 * ニュース用 JSON-LD (NewsArticle Schema)
 */
export function generateNewsJsonLd(news: {
  title: string;
  slug: string;
  thumbnail: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": news.title,
    "image": [news.thumbnail],
    "datePublished": news.createdAt.toISOString(),
    "dateModified": news.updatedAt.toISOString(),
    "author": {
      "@type": "Organization",
      "name": "余りモノ",
      "url": SITE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": "余りモノ",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`,
      },
    },
    "description": news.content.substring(0, 150).replace(/[#*`\n]/g, ""),
  };
}
