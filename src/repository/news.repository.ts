import { prisma } from "@/lib/prisma";
import { News } from "@/types";

export class NewsRepository {
  /**
   * 最新の公開済みニュースを取得
   */
  async findLatest(count: number): Promise<News[]> {
    return prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: count,
    });
  }

  /**
   * すべての公開済みニュースを取得（日付降順）
   */
  async findAll(): Promise<News[]> {
    return prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * スラッグから特定のニュースを取得
   */
  async findBySlug(slug: string): Promise<News | null> {
    return prisma.news.findFirst({
      where: { slug },
    });
  }
}
export const newsRepository = new NewsRepository();
