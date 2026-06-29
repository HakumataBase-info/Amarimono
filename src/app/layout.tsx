import type { Metadata } from "next";
import { Outfit, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { generateSiteMetadata } from "@/utils/seo";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = generateSiteMetadata({
  title: "余りモノ OFFICIAL SITE",
  description: "原田ダダスケ主催のストリーマーグループ「余りモノ」の公式ホームページ。「余っているわけじゃない、俺らがメインだ。」はみ出たモノたちによる、本気の熱狂をあなたに！",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${outfit.variable} ${notoSansJp.variable} antialiased`}
    >
      <body className="font-sans bg-[#060608] text-white min-h-screen flex flex-col justify-between selection:bg-neon-purple/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
