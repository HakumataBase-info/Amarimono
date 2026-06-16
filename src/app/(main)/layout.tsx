import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import MouseFollower from "@/components/common/MouseFollower";
import LoadingScreen from "@/components/common/LoadingScreen";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 初回訪問ローディング画面 */}
      <LoadingScreen />

      {/* マウス追従ネオン光彩 (PCのみ) */}
      <MouseFollower />

      {/* ナビゲーションヘッダー */}
      <Header />

      {/* メインコンテンツエリア */}
      <main className="flex-grow flex flex-col">{children}</main>

      {/* 共通フッター */}
      <Footer />
    </>
  );
}
