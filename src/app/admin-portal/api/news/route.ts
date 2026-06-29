import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 認証チェック
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session !== getSessionToken()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, data } = await req.json();

    if (!data.title || !data.slug) {
      return NextResponse.json({ error: "タイトルとスラッグは必須入力です。" }, { status: 400 });
    }

    // 既存のニュースを取得（更新時のみ）
    const existingNews = id ? await prisma.news.findUnique({
      where: { id },
    }) : null;

    const thumbnail = data.thumbnail === "KEEP_ORIGINAL" ? (existingNews?.thumbnail || "") : data.thumbnail;

    const newsData = {
      title: data.title,
      slug: data.slug,
      thumbnail: thumbnail,
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

    // キャッシュ更新
    revalidatePath("/");
    revalidatePath("/news");
    if (data.slug) {
      revalidatePath(`/news/${data.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API News error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
