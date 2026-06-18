import { notFound } from "next/navigation";
import SafeImage from "@/components/common/SafeImage";
import Link from "next/link";
import { Metadata } from "next";
import { Youtube, Twitter, Instagram, ChevronLeft, ChevronRight } from "lucide-react";
import { getMemberBySlug, getAdjacentMembers } from "@/services/member.service";
import { generateSiteMetadata, generateMemberJsonLd } from "@/utils/seo";
import PageTransition from "@/components/common/PageTransition";
import CareerTimeline from "@/components/member/CareerTimeline";
import GallerySlider from "@/components/member/GallerySlider";
import MovieEmbeds from "@/components/member/MovieEmbeds";

export const revalidate = 60; // キャッシュ60秒

interface MemberDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 動的メタデータ生成 (Next.js App Router)
 */
export async function generateMetadata({ params }: MemberDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = await getMemberBySlug(slug);

  if (!member) {
    return generateSiteMetadata({
      title: "MEMBER NOT FOUND",
      noIndex: true,
    });
  }

  return generateSiteMetadata({
    title: `${member.name} PROFILE`,
    description: `${member.name} (${member.reading}) の公式プロフィール。自己紹介、担当カラー、好きなゲーム、配信情報、ギャラリー、活動実績を公開中！`,
    path: `/member/${slug}`,
    ogImage: member.iconImage,
  });
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { slug } = await params;
  const member = await getMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  // 前後メンバーの取得
  const { prev, next } = await getAdjacentMembers(slug);

  // JSON-LDデータ
  const jsonLd = generateMemberJsonLd(member);

  return (
    <PageTransition>
      {/* 構造化データの挿入 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative min-h-screen pb-24 overflow-hidden">
        
        {/* ================= LARGE HERO VISUAL ================= */}
        <section className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden bg-black/80">
          <SafeImage
            src={member.headerImage}
            alt={`${member.name} Header Image`}
            fill
            priority
            className="object-cover opacity-35 filter blur-[1px]"
          />
          {/* 下部へのグラデーションフェード */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/40 to-transparent" />
          
          {/* タイトルエリア */}
          <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 z-10">
            {/* アイコン画像 */}
            <div
              className="relative w-36 h-36 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 bg-black/60 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex-shrink-0"
              style={{ borderColor: member.color }}
            >
              <SafeImage
                src={member.iconImage}
                alt={member.name}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* 名前・活動名：フィルターを親にかけて文字グラデーションをバグなく描画 */}
            <div className="text-center md:text-left" style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.95)) drop-shadow(0 1px 2px rgba(0,0,0,0.95))" }}>
              <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase opacity-65">
                {member.reading}
              </span>
              <h1
                className="text-3xl md:text-5xl font-extrabold tracking-wide mt-1.5 bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${member.color} 100%)`,
                }}
              >
                {member.name}
              </h1>
              {member.hashtag && (
                <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/5 text-slate-300">
                  {member.hashtag}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ================= PROFILE CONTENT ================= */}
        <section className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* 左カラム: 詳細プロフィール・SNS (lg: 3/12幅) */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
              {/* メンバーカラー背景装飾 */}
              <div
                className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-[40px] opacity-25"
                style={{ backgroundColor: member.color }}
              />

              <h2 className="text-lg font-bold tracking-widest text-white border-b border-white/5 pb-3">
                PROFILE
              </h2>
              
              <ul className="flex flex-col gap-4 text-sm">
                <li className="flex justify-between">
                  <span className="text-slate-500 font-medium">Favorite Game</span>
                  <span className="text-slate-200 text-right max-w-[150px] font-semibold">{member.favoriteGame}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 font-medium">Birthday</span>
                  <span className="text-slate-200 font-semibold">{member.birthday}</span>
                </li>
                {member.fanName && (
                  <li className="flex justify-between">
                    <span className="text-slate-500 font-medium">Fan Name</span>
                    <span className="text-slate-200 font-semibold">{member.fanName}</span>
                  </li>
                )}
                <li className="flex justify-between items-center mt-2 pt-4 border-t border-white/5">
                  <span className="text-slate-500 font-medium">Color</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold font-mono uppercase text-slate-300">{member.color}</span>
                    <div
                      className="w-4 h-4 rounded border border-white/10"
                      style={{ backgroundColor: member.color, boxShadow: `0 0 8px ${member.color}99` }}
                    />
                  </div>
                </li>
              </ul>

              {/* ソーシャルリンク */}
              <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-white/5">
                {member.youtube && (
                  <a
                    href={member.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#ff0000] hover:border-[#ff0000]/20 hover:bg-[#ff0000]/5 transition-all duration-300"
                    aria-label="YouTube"
                  >
                    <Youtube size={18} />
                  </a>
                )}
                {member.twitch && (
                  <a
                    href={member.twitch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#9146ff] hover:border-[#9146ff]/20 hover:bg-[#9146ff]/5 transition-all duration-300"
                    aria-label="Twitch"
                  >
                    <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                    </svg>
                  </a>
                )}
                {member.twitter && (
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300"
                    aria-label="X (Twitter)"
                  >
                    <Twitter size={18} />
                  </a>
                )}
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#e1306c] hover:border-[#e1306c]/20 hover:bg-[#e1306c]/5 transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 中央カラム: 自己紹介・経歴・ギャラリー・動画 (lg: 5/12幅、立ち絵がない場合は 9/12幅) */}
          <div className={`${member.standingImage ? "lg:col-span-5" : "lg:col-span-9"} flex flex-col gap-16`}>
            
            {/* モバイル表示時の立ち絵 (自己紹介の前に配置) */}
            {member.standingImage && (
              <div className="block lg:hidden relative w-full aspect-[3/4] max-w-xs mx-auto overflow-hidden rounded-2xl bg-gradient-to-b from-transparent to-white/5 p-4 border border-white/5">
                <SafeImage
                  src={member.standingImage}
                  alt={`${member.name} Standing`}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* 自己紹介 */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold tracking-widest text-white flex items-center gap-3">
                <span className="w-1.5 h-6 rounded" style={{ backgroundColor: member.color }} />
                INTRODUCTION
              </h3>
              <p className="text-sm md:text-base text-slate-300 leading-loose whitespace-pre-wrap">
                {member.description}
              </p>
            </div>

            {/* 活動実績・タイムライン */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold tracking-widest text-white flex items-center gap-3">
                <span className="w-1.5 h-6 rounded" style={{ backgroundColor: member.color }} />
                CAREER & ACTIVITIES
              </h3>
              <CareerTimeline careerJson={member.career} memberColor={member.color} />
            </div>

            {/* ギャラリー */}
            {member.gallery.length > 0 && (
              <div className="flex flex-col gap-6">
                <h3 className="text-xl font-bold tracking-widest text-white flex items-center gap-3">
                  <span className="w-1.5 h-6 rounded" style={{ backgroundColor: member.color }} />
                  GALLERY
                </h3>
                <GallerySlider gallery={member.gallery} />
              </div>
            )}

            {/* 動画埋め込み */}
            {member.movies.length > 0 && (
              <div className="flex flex-col gap-6">
                <h3 className="text-xl font-bold tracking-widest text-white flex items-center gap-3">
                  <span className="w-1.5 h-6 rounded" style={{ backgroundColor: member.color }} />
                  FEATURED VIDEOS
                </h3>
                <MovieEmbeds movies={member.movies} memberColor={member.color} />
              </div>
            )}
          </div>

          {/* 右カラム: デスクトップ表示時の大きな立ち絵 (lg: 4/12幅、マージンで左側に引き寄せ) */}
          {member.standingImage && (
            <div className="hidden lg:block lg:col-span-4 lg:-ml-12">
              <div className="sticky top-24 w-full h-[80vh] flex items-center justify-start group">
                {/* 立ち絵背後のネオン光彩: 完全に中央からのみの光 */}
                <div
                  className="absolute w-56 h-56 rounded-full opacity-40 blur-[50px] pointer-events-none left-[45%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 transition-transform duration-1000 group-hover:scale-110"
                  style={{
                    background: `radial-gradient(circle, ${member.color} 0%, transparent 70%)`
                  }}
                />
                <SafeImage
                  src={member.standingImage}
                  alt={`${member.name} Standing`}
                  fill
                  className="object-contain relative z-10 transition-transform duration-700 scale-[1.2] group-hover:scale-[1.25]"
                />
              </div>
            </div>
          )}
        </section>

        {/* ================= RELATED / ADJACENT MEMBERS ================= */}
        {(prev || next) && (
          <section className="max-w-7xl mx-auto px-6 mt-24 pt-12 border-t border-white/5 relative z-10">
            <h3 className="text-center text-xs font-bold tracking-[0.3em] text-slate-500 uppercase mb-8">
              OTHER MEMBERS
            </h3>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 max-w-4xl mx-auto">
              {prev && (
                <Link
                  href={`/member/${prev.slug}`}
                  className="w-full sm:w-1/2 glass-panel p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:border-white/20 group"
                >
                  <ChevronLeft size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                    <SafeImage
                      src={prev.iconImage}
                      alt={prev.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">PREV MEMBER</span>
                    <h4 className="text-sm font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors"
                        style={{
                          backgroundImage: `linear-gradient(135deg, #ffffff, ${prev.color})`
                        }}>
                      {prev.name}
                    </h4>
                  </div>
                </Link>
              )}

              {next && (
                <Link
                  href={`/member/${next.slug}`}
                  className="w-full sm:w-1/2 glass-panel p-5 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 hover:border-white/20 group text-right"
                >
                  <div className="flex items-center gap-4 text-right ml-auto">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block text-right">NEXT MEMBER</span>
                      <h4 className="text-sm font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors block text-right"
                          style={{
                            backgroundImage: `linear-gradient(135deg, #ffffff, ${next.color})`
                          }}>
                        {next.name}
                      </h4>
                    </div>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                      <SafeImage
                        src={next.iconImage}
                        alt={next.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                </Link>
              )}
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
}
