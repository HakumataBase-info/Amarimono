import { prisma } from "@/lib/prisma";
import { MemberWithRelations, MemberSummary } from "@/types";

export class MemberRepository {
  /**
   * すべてのメンバー概要を取得（名前順または作成順）
   */
  async findAll(): Promise<MemberSummary[]> {
    return prisma.member.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        reading: true,
        iconImage: true,
        description: true,
        color: true,
        favoriteGame: true,
        youtube: true,
        twitch: true,
        twitter: true,
        tiktok: true,
        instagram: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * スラッグから詳細なメンバー情報を取得（ギャラリー、映画含む）
   */
  async findBySlug(slug: string): Promise<MemberWithRelations | null> {
    return prisma.member.findFirst({
      where: { slug },
      include: {
        gallery: {
          orderBy: { order: "asc" },
        },
        movies: true,
      },
    });
  }

  /**
   * 前後のメンバーの簡易情報を取得（詳細ページのナビゲーション用）
   */
  async findAdjacent(slug: string): Promise<{ prev: MemberSummary | null; next: MemberSummary | null }> {
    const all = await this.findAll();
    const index = all.findIndex((m) => m.slug === slug);

    if (index === -1) {
      return { prev: null, next: null };
    }

    const prev = index > 0 ? all[index - 1] : all[all.length - 1]; // ループ構造
    const next = index < all.length - 1 ? all[index + 1] : all[0]; // ループ構造

    // メンバーが1人以下の場合は前後を表示しない
    if (all.length <= 1) {
      return { prev: null, next: null };
    }

    return { prev, next };
  }
}
export const memberRepository = new MemberRepository();
