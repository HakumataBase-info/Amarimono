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

    if (!data.name || !data.slug || !data.reading) {
      return NextResponse.json({ error: "名前、スラッグ、ふりがなは必須入力です。" }, { status: 400 });
    }

    // 既存のメンバーとギャラリー画像情報を取得（更新時のみ）
    const existingMember = id ? await prisma.member.findUnique({
      where: { id },
      include: {
        gallery: {
          orderBy: { order: "asc" },
        },
      },
    }) : null;

    const iconImage = data.iconImage === "KEEP_ORIGINAL" ? (existingMember?.iconImage || "") : data.iconImage;
    const headerImage = data.headerImage === "KEEP_ORIGINAL" ? (existingMember?.headerImage || null) : (data.headerImage || null);
    const standingImage = data.standingImage === "KEEP_ORIGINAL" ? (existingMember?.standingImage || null) : (data.standingImage || null);

    const memberData = {
      name: data.name,
      slug: data.slug,
      reading: data.reading,
      iconImage: iconImage,
      headerImage: headerImage,
      standingImage: standingImage,
      description: data.description,
      favoriteGame: data.favoriteGame,
      color: data.color,
      birthday: data.birthday,
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
        await tx.member.update({
          where: { id },
          data: memberData,
        });

        // ギャラリーの入れ替え
        const galleryData = data.galleryUrls.map((url: string, idx: number) => {
          let imageUrl = url;
          if (url.startsWith("KEEP_ORIGINAL:")) {
            const origIdx = parseInt(url.split(":")[1], 10);
            imageUrl = existingMember?.gallery[origIdx]?.image || "";
          }
          return {
            memberId: id,
            image: imageUrl,
            order: idx + 1,
          };
        });

        await tx.gallery.deleteMany({ where: { memberId: id } });
        if (galleryData.length > 0) {
          await tx.gallery.createMany({
            data: galleryData,
          });
        }

        await tx.movie.deleteMany({ where: { memberId: id } });
        if (data.movieYoutubeIds && data.movieYoutubeIds.length > 0) {
          await tx.movie.createMany({
            data: data.movieYoutubeIds.map((item: { youtubeId: string; title: string }) => ({
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

        if (data.galleryUrls && data.galleryUrls.length > 0) {
          await tx.gallery.createMany({
            data: data.galleryUrls.map((url: string, idx: number) => ({
              memberId: newMember.id,
              image: url,
              order: idx + 1,
            })),
          });
        }

        if (data.movieYoutubeIds && data.movieYoutubeIds.length > 0) {
          await tx.movie.createMany({
            data: data.movieYoutubeIds.map((item: { youtubeId: string; title: string }) => ({
              memberId: newMember.id,
              youtubeId: item.youtubeId,
              title: item.title,
            })),
          });
        }
      });
    }

    // キャッシュ更新
    revalidatePath("/");
    revalidatePath("/member");
    if (data.slug) {
      revalidatePath(`/member/${data.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API Member error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
