"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// 暗号セッショントークン生成
function getSessionToken() {
  return crypto.createHmac("sha256", PASSWORD).update("portal-admin-session").digest("hex");
}

/**
 * ログイン処理
 */
export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  if (password === PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", getSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1日有効
      path: "/admin-portal",
    });
    return { success: true };
  }
  return { success: false, error: "パスワードが正しくありません。" };
}

/**
 * ログアウト処理
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

/**
 * 認証チェック
 */
export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return session === getSessionToken();
}

/**
 * メンバー作成・更新
 */
export async function createOrUpdateMember(
  id: string | null,
  data: {
    name: string;
    slug: string;
    reading: string;
    iconImage: string;
    headerImage: string;
    description: string;
    favoriteGame: string;
    color: string;
    birthday: string;
    height: string;
    hobby: string;
    youtube?: string;
    twitch?: string;
    twitter?: string;
    tiktok?: string;
    instagram?: string;
    fanName?: string;
    hashtag?: string;
    career: string; // JSON文字列
    galleryUrls: string[]; // ギャラリー画像URLリスト
    movieYoutubeIds: { youtubeId: string; title: string }[]; // YouTube動画リスト
  }
) {
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const memberData = {
    name: data.name,
    slug: data.slug,
    reading: data.reading,
    iconImage: data.iconImage,
    headerImage: data.headerImage,
    description: data.description,
    favoriteGame: data.favoriteGame,
    color: data.color,
    birthday: data.birthday,
    height: data.height,
    hobby: data.hobby,
    youtube: data.youtube || null,
    twitch: data.twitch || null,
    twitter: data.twitter || null,
    tiktok: data.tiktok || null,
    instagram: data.instagram || null,
    fanName: data.fanName || null,
    hashtag: data.hashtag || null,
    career: data.career,
  };

  if (id) {
    // 更新処理
    await prisma.$transaction(async (tx) => {
      // メンバー基本情報の更新
      await tx.member.update({
        where: { id },
        data: memberData,
      });

      // ギャラリーの入れ替え
      await tx.gallery.deleteMany({ where: { memberId: id } });
      if (data.galleryUrls.length > 0) {
        await tx.gallery.createMany({
          data: data.galleryUrls.map((url, idx) => ({
            memberId: id,
            image: url,
            order: idx + 1,
          })),
        });
      }

      // 動画の入れ替え
      await tx.movie.deleteMany({ where: { memberId: id } });
      if (data.movieYoutubeIds.length > 0) {
        await tx.movie.createMany({
          data: data.movieYoutubeIds.map((item) => ({
            memberId: id,
            youtubeId: item.youtubeId,
            title: item.title,
          })),
        });
      }
    });
  } else {
    // 新規作成処理
    await prisma.$transaction(async (tx) => {
      const newMember = await tx.member.create({
        data: memberData,
      });

      if (data.galleryUrls.length > 0) {
        await tx.gallery.createMany({
          data: data.galleryUrls.map((url, idx) => ({
            memberId: newMember.id,
            image: url,
            order: idx + 1,
          })),
        });
      }

      if (data.movieYoutubeIds.length > 0) {
        await tx.movie.createMany({
          data: data.movieYoutubeIds.map((item) => ({
            memberId: newMember.id,
            youtubeId: item.youtubeId,
            title: item.title,
          })),
        });
      }
    });
  }

  // Next.jsのページキャッシュを更新
  revalidatePath("/");
  revalidatePath("/member");
  if (data.slug) {
    revalidatePath(`/member/${data.slug}`);
  }
}

/**
 * メンバー削除
 */
export async function deleteMember(id: string, slug: string) {
  if (!(await checkAuth())) throw new Error("Unauthorized");

  // リレーションは Cascade なので自動削除されます
  await prisma.member.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/member");
  revalidatePath(`/member/${slug}`);
}

/**
 * ニュース作成・更新
 */
export async function createOrUpdateNews(
  id: string | null,
  data: {
    title: string;
    slug: string;
    thumbnail: string;
    content: string;
    published: boolean;
  }
) {
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const newsData = {
    title: data.title,
    slug: data.slug,
    thumbnail: data.thumbnail,
    content: data.content,
    published: data.published,
  };

  if (id) {
    await prisma.news.update({
      where: { id },
      data: newsData,
    });
  } else {
    await prisma.news.create({
      data: newsData,
    });
  }

  revalidatePath("/");
  revalidatePath("/news");
  if (data.slug) {
    revalidatePath(`/news/${data.slug}`);
  }
}

/**
 * ニュース削除
 */
export async function deleteNews(id: string, slug: string) {
  if (!(await checkAuth())) throw new Error("Unauthorized");

  await prisma.news.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
}
