import { Member as PrismaMember, Gallery, Movie, News as PrismaNews } from "@prisma/client";

export interface CareerItem {
  date: string;
  title: string;
}

export interface MemberWithRelations extends PrismaMember {
  gallery: Gallery[];
  movies: Movie[];
}

export type MemberSummary = Pick<
  PrismaMember,
  "id" | "name" | "slug" | "reading" | "iconImage" | "description" | "color" | "favoriteGame" | "youtube" | "twitch" | "twitter" | "tiktok" | "instagram"
>;

export type News = PrismaNews;

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
