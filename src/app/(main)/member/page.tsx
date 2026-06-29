import { getMembers } from "@/services/member.service";
import MemberCard from "@/components/member/MemberCard";
import PageTransition from "@/components/common/PageTransition";
import { generateSiteMetadata } from "@/utils/seo";
import { Metadata } from "next";

export const revalidate = 86400; // キャッシュ24時間

export const metadata: Metadata = generateSiteMetadata({
  title: "MEMBER 一覧",
  description: "原田ダダスケ主催のストリーマーグループ「余りモノ」に所属するはみ出たモノたちの一覧。個性あふれるメンバーのプロフィールや活動情報はこちらからチェック！",
  path: "/member",
});

export default async function MemberPage() {
  const members = await getMembers();

  return (
    <PageTransition>
      <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
        {/* 背景光彩 */}
        <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-pink-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* ページタイトル */}
          <div className="text-center mb-16 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-400 uppercase">
              Our Streamers
            </span>
            <h1 className="text-4xl font-extrabold tracking-widest text-white mt-1 uppercase">
              MEMBERS
            </h1>
            <div className="w-12 h-[2px] bg-gradient-to-r from-emerald-400 to-cyan-400 mt-4" />
          </div>

          {/* メンバーグリッド */}
          {members.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              メンバーが登録されていません。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
