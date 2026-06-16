import { newsRepository } from "@/repository/news.repository";
import { News } from "@/types";

export class NewsService {
  async getLatestNews(count: number = 3): Promise<News[]> {
    return newsRepository.findLatest(count);
  }

  async getAllNews(): Promise<News[]> {
    return newsRepository.findAll();
  }

  async getNewsBySlug(slug: string): Promise<News | null> {
    return newsRepository.findBySlug(slug);
  }
}
export const newsService = new NewsService();
export const getLatestNews = (count: number = 3) => newsService.getLatestNews(count);
export const getAllNews = () => newsService.getAllNews();
export const getNewsBySlug = (slug: string) => newsService.getNewsBySlug(slug);
