import { checkAuth } from "./actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPortalPage() {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    redirect("/admin-portal/login");
  }

  // メンバーとニュースを全件取得
  const [members, news] = await Promise.all([
    prisma.member.findMany({
      include: {
        gallery: {
          orderBy: { order: "asc" },
        },
        movies: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.news.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <AdminDashboardClient initialMembers={members} initialNews={news} />;
}
