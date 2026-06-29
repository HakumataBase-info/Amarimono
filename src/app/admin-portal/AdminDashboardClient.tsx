"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/common/SafeImage";
import {
  createOrUpdateMember,
  deleteMember,
  createOrUpdateNews,
  deleteNews,
  logoutAdmin,
  fetchYoutubeTitle,
} from "./actions";
import {
  Plus,
  Edit,
  Trash2,
  LogOut,
  ExternalLink,
  FileText,
  Users,
  Save,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface GalleryItem {
  id: string;
  memberId: string;
  image: string;
  order: number;
}

interface MovieItem {
  id: string;
  memberId: string;
  youtubeId: string;
  title: string;
}

interface MemberWithRelations {
  id: string;
  name: string;
  slug: string;
  reading: string;
  iconImage: string;
  headerImage: string | null;
  standingImage: string | null;
  description: string;
  favoriteGame: string;
  color: string;
  birthday: string;
  youtube: string | null;
  twitch: string | null;
  twitter: string | null;
  tiktok: string | null;
  instagram: string | null;
  fanName: string | null;
  hashtag: string | null;
  career: string; // JSON String
  createdAt: Date;
  updatedAt: Date;
  gallery: GalleryItem[];
  movies: MovieItem[];
}

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  content: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AdminDashboardClientProps {
  initialMembers: MemberWithRelations[];
  initialNews: NewsItem[];
}

const compressAndResizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get 2d context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 透過情報を維持しつつ容量を極小化するため、PNG/WebP/GIFは image/webp 形式に変換して圧縮率を高める
        let outputFormat = "image/jpeg";
        if (file.type === "image/png" || file.type === "image/webp" || file.type === "image/gif") {
          outputFormat = "image/webp";
        }
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

const extractYoutubeId = (urlOrId: string): string => {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

const parseDateString = (dateStr: string): number => {
  if (!dateStr) return 0;
  // 2024.04 や 2024/04 や 2024-04 などをパース
  const matches = dateStr.trim().match(/^(\d{4})[./\-\s年]?(\d{1,2})?/);
  if (matches) {
    const year = parseInt(matches[1], 10);
    const month = matches[2] ? parseInt(matches[2], 10) : 1;
    return year * 100 + month;
  }
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
};

export default function AdminDashboardClient({
  initialMembers,
  initialNews,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"members" | "news">("members");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 画像ファイルアップロード時のBase64エンコード処理（リサイズ・圧縮機能付き）
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "iconImage" | "headerImage" | "standingImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 許容最大サイズは 10MB に緩和（クライアント側で圧縮するため）
    if (file.size > 10 * 1024 * 1024) {
      alert("ファイルサイズが大きすぎます。10MB以下の画像を選択してください。");
      return;
    }

    try {
      let maxWidth = 1200;
      let maxHeight = 1200;
      let quality = 0.85;

      if (field === "iconImage") {
        // 解像度を 500x500、画質を 0.85 に引き上げてガビガビ感を解消
        maxWidth = 500;
        maxHeight = 500;
        quality = 0.85;
      } else if (field === "headerImage") {
        maxWidth = 1200;
        maxHeight = 800;
        quality = 0.8;
      } else if (field === "standingImage") {
        // 立ち絵は解像度 1000x1400、画質 0.85 に引き上げて高精細化
        maxWidth = 1000;
        maxHeight = 1400;
        quality = 0.85;
      }

      const base64Data = await compressAndResizeImage(file, maxWidth, maxHeight, quality);
      setEditingMember((prev) =>
        prev ? { ...prev, [field]: base64Data } : null
      );
    } catch (err: any) {
      alert("画像の読み込み・圧縮に失敗しました: " + err.message);
    }
  };

  // ギャラリー画像ファイルアップロード処理（圧縮機能付き）
  const handleGalleryImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("ファイルサイズが大きすぎます。10MB以下の画像を選択してください。");
      return;
    }

    try {
      // ギャラリー画像は最大幅 1200px、画質 0.8 に自動リサイズ・圧縮して高精細化
      const base64Data = await compressAndResizeImage(file, 1200, 900, 0.8);
      const newUrls = [...memberGalleryUrls];
      newUrls[idx] = base64Data;
      setMemberGalleryUrls(newUrls);
    } catch (err: any) {
      alert("画像の読み込み・圧縮に失敗しました: " + err.message);
    }
  };

  // ニュースのサムネイル画像ファイルアップロード処理（リサイズ・圧縮機能付き）
  const handleNewsThumbnailFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("ファイルサイズが大きすぎます。10MB以下の画像を選択してください。");
      return;
    }

    try {
      // サムネイル用に幅1200px、画質0.8に自動リサイズ・圧縮して高精細化
      const base64Data = await compressAndResizeImage(file, 1200, 800, 0.8);
      setEditingNews((prev) =>
        prev ? { ...prev, thumbnail: base64Data } : null
      );
    } catch (err: any) {
      alert("画像の読み込み・圧縮に失敗しました: " + err.message);
    }
  };

  // メンバー編集/作成状態
  const [editingMember, setEditingMember] = useState<Partial<MemberWithRelations> | null>(null);
  const [memberGalleryUrls, setMemberGalleryUrls] = useState<string[]>([]);
  const [memberMovies, setMemberMovies] = useState<{ youtubeId: string; title: string }[]>([]);
  const [memberCareers, setMemberCareers] = useState<{ date: string; title: string }[]>([]);

  // 動画自動取得状態
  const [fetchingMovieIdxs, setFetchingMovieIdxs] = useState<Record<number, boolean>>({});

  const handleMovieUrlOrIdChange = async (val: string, idx: number) => {
    const newMovies = [...memberMovies];
    newMovies[idx].youtubeId = val;
    setMemberMovies(newMovies);

    const id = extractYoutubeId(val);
    if (id) {
      newMovies[idx].youtubeId = id;
      setMemberMovies([...newMovies]);

      setFetchingMovieIdxs((prev) => ({ ...prev, [idx]: true }));
      try {
        const title = await fetchYoutubeTitle(id);
        if (title) {
          const updatedMovies = [...newMovies];
          updatedMovies[idx].title = title;
          setMemberMovies(updatedMovies);
        }
      } catch (err: any) {
        console.error("Failed to fetch title for ID:", id, err.message);
      } finally {
        setFetchingMovieIdxs((prev) => {
          const next = { ...prev };
          delete next[idx];
          return next;
        });
      }
    }
  };

  // 経歴の日付順ソート処理
  const handleSortCareers = () => {
    const sorted = [...memberCareers].sort((a, b) => {
      return parseDateString(a.date) - parseDateString(b.date);
    });
    setMemberCareers(sorted);
  };

  // ニュース編集/作成状態
  const [editingNews, setEditingNews] = useState<Partial<NewsItem> | null>(null);

  // ログアウト処理
  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await logoutAdmin();
      router.push("/admin-portal/login");
      router.refresh();
    }
  };

  // --- メンバー CRUD 処理 ---
  const startAddMember = () => {
    setEditingMember({
      id: undefined,
      name: "",
      slug: "",
      reading: "",
      iconImage: "",
      headerImage: "",
      standingImage: "",
      description: "",
      favoriteGame: "",
      color: "#06B6D4",
      birthday: "",
      youtube: "",
      twitch: "",
      twitter: "",
      tiktok: "",
      instagram: "",
      fanName: "",
      hashtag: "",
    });
    setMemberGalleryUrls([]);
    setMemberMovies([]);
    setMemberCareers([]);
    setErrorMsg(null);
  };

  const startEditMember = (member: MemberWithRelations) => {
    setEditingMember({
      id: member.id,
      name: member.name,
      slug: member.slug,
      reading: member.reading,
      iconImage: member.iconImage,
      headerImage: member.headerImage,
      standingImage: member.standingImage || "",
      description: member.description,
      favoriteGame: member.favoriteGame,
      color: member.color,
      birthday: member.birthday,
      youtube: member.youtube || "",
      twitch: member.twitch || "",
      twitter: member.twitter || "",
      tiktok: member.tiktok || "",
      instagram: member.instagram || "",
      fanName: member.fanName || "",
      hashtag: member.hashtag || "",
    });
    setMemberGalleryUrls(member.gallery.map((g) => g.image));
    setMemberMovies(member.movies.map((m) => ({ youtubeId: m.youtubeId, title: m.title })));
    try {
      setMemberCareers(JSON.parse(member.career));
    } catch {
      setMemberCareers([]);
    }
    setErrorMsg(null);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setErrorMsg(null);

    // バリデーション
    if (!editingMember.name || !editingMember.slug || !editingMember.reading) {
      setErrorMsg("名前、スラッグ、ふりがなは必須入力です。");
      return;
    }

    startTransition(async () => {
      try {
        // 既存の画像と比較して、変更されていない場合は "KEEP_ORIGINAL" を送信して転送量を削減
        const origMember = initialMembers.find(m => m.id === editingMember.id);
        
        const payloadIcon = editingMember.iconImage?.startsWith("data:") 
          ? editingMember.iconImage 
          : (editingMember.id ? "KEEP_ORIGINAL" : editingMember.iconImage || "");

        const payloadHeader = editingMember.headerImage?.startsWith("data:") 
          ? editingMember.headerImage 
          : (editingMember.id ? "KEEP_ORIGINAL" : editingMember.headerImage || "");

        const payloadStanding = editingMember.standingImage?.startsWith("data:") 
          ? editingMember.standingImage 
          : (editingMember.id ? "KEEP_ORIGINAL" : editingMember.standingImage || "");

        const payloadGallery = memberGalleryUrls.map((url) => {
          if (!url.startsWith("data:") && origMember) {
            const origIdx = origMember.gallery.findIndex(g => g.image === url);
            if (origIdx !== -1) {
              return `KEEP_ORIGINAL:${origIdx}`;
            }
          }
          return url;
        });

        const response = await fetch("/admin-portal/api/member", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingMember.id || null,
            data: {
              name: editingMember.name!,
              slug: editingMember.slug!,
              reading: editingMember.reading!,
              iconImage: payloadIcon,
              headerImage: payloadHeader,
              standingImage: payloadStanding,
              description: editingMember.description || "",
              favoriteGame: editingMember.favoriteGame || "",
              color: editingMember.color || "#06B6D4",
              birthday: editingMember.birthday || "",
              youtube: editingMember.youtube || undefined,
              twitch: editingMember.twitch || undefined,
              twitter: editingMember.twitter || undefined,
              tiktok: editingMember.tiktok || undefined,
              instagram: editingMember.instagram || undefined,
              fanName: editingMember.fanName || undefined,
              hashtag: editingMember.hashtag || undefined,
              career: JSON.stringify(
                [...memberCareers].sort((a, b) => parseDateString(a.date) - parseDateString(b.date))
              ),
              galleryUrls: payloadGallery,
              movieYoutubeIds: memberMovies,
            },
          }),
        });

        if (!response.ok) {
          let errMsg = "メンバーの保存に失敗しました。";
          try {
            const resData = await response.json();
            errMsg = resData.error || errMsg;
          } catch (e) {
            if (response.status === 413) {
              errMsg = "画像ファイルの合計サイズが大きすぎます。画質を下げるか、画像の解像度を小さくしてください。";
            } else {
              errMsg = `サーバーエラーが発生しました (ステータス: ${response.status})`;
            }
          }
          throw new Error(errMsg);
        }

        setEditingMember(null);
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err.message || "メンバーの保存に失敗しました。スラッグの重複等を確認してください。");
      }
    });
  };

  const handleDeleteMember = async (id: string, name: string, slug: string) => {
    if (confirm(`本当にメンバー「${name}」を削除しますか？\n紐づくギャラリー写真とYouTube動画もすべて削除されます。`)) {
      startTransition(async () => {
        try {
          await deleteMember(id, slug);
          router.refresh();
        } catch (err: any) {
          alert("削除に失敗しました: " + err.message);
        }
      });
    }
  };

  // --- ニュース CRUD 処理 ---
  const startAddNews = () => {
    setEditingNews({
      id: undefined,
      title: "",
      slug: "",
      thumbnail: "",
      content: "",
      published: true,
    });
    setErrorMsg(null);
  };

  const startEditNews = (news: NewsItem) => {
    setEditingNews({
      id: news.id,
      title: news.title,
      slug: news.slug,
      thumbnail: news.thumbnail,
      content: news.content,
      published: news.published,
    });
    setErrorMsg(null);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    setErrorMsg(null);

    if (!editingNews.title || !editingNews.slug) {
      setErrorMsg("タイトルとスラッグは必須入力です。");
      return;
    }

    startTransition(async () => {
      try {
        const payloadThumbnail = editingNews.thumbnail?.startsWith("data:") 
          ? editingNews.thumbnail 
          : (editingNews.id ? "KEEP_ORIGINAL" : editingNews.thumbnail || "");

        const response = await fetch("/admin-portal/api/news", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingNews.id || null,
            data: {
              title: editingNews.title!,
              slug: editingNews.slug!,
              thumbnail: payloadThumbnail,
              content: editingNews.content || "",
              published: editingNews.published ?? true,
            },
          }),
        });

        if (!response.ok) {
          let errMsg = "ニュースの保存に失敗しました。";
          try {
            const resData = await response.json();
            errMsg = resData.error || errMsg;
          } catch (e) {
            if (response.status === 413) {
              errMsg = "画像ファイルの合計サイズが大きすぎます。画質を下げるか、画像の解像度を小さくしてください。";
            } else {
              errMsg = `サーバーエラーが発生しました (ステータス: ${response.status})`;
            }
          }
          throw new Error(errMsg);
        }

        setEditingNews(null);
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err.message || "ニュースの保存に失敗しました。スラッグの重複等を確認してください。");
      }
    });
  };

  const handleDeleteNews = async (id: string, title: string, slug: string) => {
    if (confirm(`本当にニュース「${title}」を削除しますか？`)) {
      startTransition(async () => {
        try {
          await deleteNews(id, slug);
          router.refresh();
        } catch (err: any) {
          alert("削除に失敗しました: " + err.message);
        }
      });
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* 共通ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <SafeImage src="/logo.png" alt="Logo" width={50} height={30} className="object-contain filter drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
            <h1 className="text-xl sm:text-2xl font-black tracking-widest text-white">
              ADMIN CONTROL PANEL
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            公式サイト「余りモノ」のリアルタイム編集ダッシュボード
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/20 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 transition cursor-pointer"
          >
            サイトを表示 <ExternalLink size={14} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 border border-rose-500/20 hover:border-rose-500/40 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 transition cursor-pointer"
          >
            ログアウト <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* タブ選択 */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => {
            setActiveTab("members");
            setEditingMember(null);
            setEditingNews(null);
          }}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-bold text-sm tracking-wider uppercase transition cursor-pointer ${
            activeTab === "members"
              ? "border-cyan-400 text-cyan-400 bg-cyan-400/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users size={16} /> メンバー管理
        </button>
        <button
          onClick={() => {
            setActiveTab("news");
            setEditingMember(null);
            setEditingNews(null);
          }}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-bold text-sm tracking-wider uppercase transition cursor-pointer ${
            activeTab === "news"
              ? "border-pink-500 text-pink-500 bg-pink-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText size={16} /> ニュース管理
        </button>
      </div>

      {/* 編集フォーム（優先表示） */}
      {editingMember && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-cyan-400" />
              {editingMember.id ? "メンバー情報を編集" : "新規メンバー登録"}
            </h2>
            <button
              onClick={() => setEditingMember(null)}
              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveMember} className="space-y-6">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 border-l-2 border-cyan-400 pl-2 tracking-wider">
                  基本プロフィール
                </h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">名前 *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-sm"
                    placeholder="黒鉄 レン"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">URLスラッグ (英数字・ハイフン) *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.slug || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-sm"
                    placeholder="ren-kurogane"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ふりがな *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.reading || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, reading: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-sm"
                    placeholder="くろがね れん"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">メンバーカラー (HEX値) *</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editingMember.color || "#06B6D4"}
                      onChange={(e) => setEditingMember({ ...editingMember, color: e.target.value })}
                      className="w-10 h-10 border border-white/10 rounded bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={editingMember.color || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, color: e.target.value })}
                      className="flex-grow px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-sm"
                      placeholder="#7C3AED"
                    />
                  </div>
                </div>
                {/* アイコン画像 */}
                <div className="space-y-2">
                  <label className="block text-xs text-slate-400 font-bold">アイコン画像 (プロフィール用) *</label>
                  <div className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                      {editingMember.iconImage ? (
                        <SafeImage src={editingMember.iconImage} alt="Icon Preview" fill className="object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-500">No Image</span>
                      )}
                    </div>
                    <div className="flex-grow space-y-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, "iconImage")}
                        className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-white/5 file:text-slate-300 hover:file:bg-white/10 file:cursor-pointer"
                      />
                      {(!editingMember.iconImage || !editingMember.iconImage.startsWith("data:")) ? (
                        <input
                          type="text"
                          value={editingMember.iconImage || ""}
                          onChange={(e) => setEditingMember({ ...editingMember, iconImage: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-white/10 rounded bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-xs"
                          placeholder="または画像URLを直接入力..."
                        />
                      ) : (
                        <div className="flex items-center justify-between px-2.5 py-1.5 border border-white/10 rounded bg-cyan-950/20 text-cyan-400 text-xs">
                          <span className="truncate max-w-[200px]">✓ 画像ファイルが選択されています</span>
                          <button
                            type="button"
                            onClick={() => setEditingMember({ ...editingMember, iconImage: "" })}
                            className="text-pink-500 hover:text-pink-400 font-semibold text-[10px] cursor-pointer"
                          >
                            クリア
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ヘッダー画像 */}
                <div className="space-y-2">
                  <label className="block text-xs text-slate-400 font-bold">ヘッダー画像 (詳細ページ背景用)</label>
                  <div className="flex gap-3 items-center">
                    <div className="relative w-20 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                      {editingMember.headerImage ? (
                        <SafeImage src={editingMember.headerImage} alt="Header Preview" fill className="object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-500">No Image</span>
                      )}
                    </div>
                    <div className="flex-grow space-y-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, "headerImage")}
                        className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-white/5 file:text-slate-300 hover:file:bg-white/10 file:cursor-pointer"
                      />
                      {(!editingMember.headerImage || !editingMember.headerImage.startsWith("data:")) ? (
                        <input
                          type="text"
                          value={editingMember.headerImage || ""}
                          onChange={(e) => setEditingMember({ ...editingMember, headerImage: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-white/10 rounded bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-xs"
                          placeholder="または画像URLを直接入力..."
                        />
                      ) : (
                        <div className="flex items-center justify-between px-2.5 py-1.5 border border-white/10 rounded bg-cyan-950/20 text-cyan-400 text-xs">
                          <span className="truncate max-w-[200px]">✓ 画像ファイルが選択されています</span>
                          <button
                            type="button"
                            onClick={() => setEditingMember({ ...editingMember, headerImage: "" })}
                            className="text-pink-500 hover:text-pink-400 font-semibold text-[10px] cursor-pointer"
                          >
                            クリア
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 立ち絵画像 */}
                <div className="space-y-2">
                  <label className="block text-xs text-slate-400 font-bold">立ち絵画像 (透過全身イラスト用)</label>
                  <div className="flex gap-3 items-center">
                    <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                      {editingMember.standingImage ? (
                        <SafeImage src={editingMember.standingImage} alt="Standing Preview" fill className="object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-500">No Image</span>
                      )}
                    </div>
                    <div className="flex-grow space-y-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, "standingImage")}
                        className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-white/5 file:text-slate-300 hover:file:bg-white/10 file:cursor-pointer"
                      />
                      {(!editingMember.standingImage || !editingMember.standingImage.startsWith("data:")) ? (
                        <input
                          type="text"
                          value={editingMember.standingImage || ""}
                          onChange={(e) => setEditingMember({ ...editingMember, standingImage: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-white/10 rounded bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-xs"
                          placeholder="または画像URLを直接入力..."
                        />
                      ) : (
                        <div className="flex items-center justify-between px-2.5 py-1.5 border border-white/10 rounded bg-cyan-950/20 text-cyan-400 text-xs">
                          <span className="truncate max-w-[200px]">✓ 画像ファイルが選択されています</span>
                          <button
                            type="button"
                            onClick={() => setEditingMember({ ...editingMember, standingImage: "" })}
                            className="text-pink-500 hover:text-pink-400 font-semibold text-[10px] cursor-pointer"
                          >
                            クリア
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 詳細・SNS */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 border-l-2 border-cyan-400 pl-2 tracking-wider">
                  パーソナルデータ & SNSリンク
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">誕生日</label>
                    <input
                      type="text"
                      value={editingMember.birthday || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, birthday: e.target.value })}
                      className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-sm"
                      placeholder="10月24日"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">好きなゲーム</label>
                    <input
                      type="text"
                      value={editingMember.favoriteGame || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, favoriteGame: e.target.value })}
                      className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-sm"
                      placeholder="VALORANT, Apex Legends"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ファンネーム</label>
                    <input
                      type="text"
                      value={editingMember.fanName || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, fanName: e.target.value })}
                      className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-sm"
                      placeholder="レンゾク魔"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ハッシュタグ</label>
                    <input
                      type="text"
                      value={editingMember.hashtag || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, hashtag: e.target.value })}
                      className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-sm"
                      placeholder="#レン起動中"
                    />
                  </div>
                </div>

                {/* SNSリンク */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">YouTube URL</label>
                    <input
                      type="text"
                      value={editingMember.youtube || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, youtube: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-xs"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Twitch URL</label>
                    <input
                      type="text"
                      value={editingMember.twitch || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, twitch: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-xs"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Twitter URL</label>
                    <input
                      type="text"
                      value={editingMember.twitter || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, twitter: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-xs"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">TikTok URL</label>
                    <input
                      type="text"
                      value={editingMember.tiktok || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, tiktok: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-xs"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Instagram URL</label>
                    <input
                      type="text"
                      value={editingMember.instagram || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, instagram: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-xs"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 自己紹介 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400">自己紹介 *</label>
              <textarea
                value={editingMember.description || ""}
                onChange={(e) => setEditingMember({ ...editingMember, description: e.target.value })}
                rows={3}
                required
                className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-sm"
                placeholder="「余りモノ」のリーダー。圧倒的なエイム力で..."
              />
            </div>

            {/* 経歴管理（動的リスト） */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <label className="text-xs font-bold text-slate-400 border-l-2 border-cyan-400 pl-2 tracking-wider">
                  経歴・活動実績
                </label>
                <div className="flex gap-4">
                  {memberCareers.length > 1 && (
                    <button
                      type="button"
                      onClick={handleSortCareers}
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                      日付で並び替え
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMemberCareers([...memberCareers, { date: "", title: "" }])}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    <Plus size={14} /> 経歴を追加
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {memberCareers.map((c, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={c.date}
                      onChange={(e) => {
                        const newCareers = [...memberCareers];
                        newCareers[idx].date = e.target.value;
                        setMemberCareers(newCareers);
                      }}
                      className="w-24 px-2 py-1.5 border border-white/10 rounded bg-black/40 text-white text-xs"
                      placeholder="2024.04"
                    />
                    <input
                      type="text"
                      value={c.title}
                      onChange={(e) => {
                        const newCareers = [...memberCareers];
                        newCareers[idx].title = e.target.value;
                        setMemberCareers(newCareers);
                      }}
                      className="flex-grow px-2 py-1.5 border border-white/10 rounded bg-black/40 text-white text-xs"
                      placeholder="「余りモノ」結成、活動開始"
                    />
                    <button
                      type="button"
                      onClick={() => setMemberCareers(memberCareers.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {memberCareers.length === 0 && (
                  <p className="text-xs text-slate-500 italic">経歴はありません。上のボタンから追加できます。</p>
                )}
              </div>
            </div>

            {/* ギャラリー画像URL管理（動的リスト） */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 border-l-2 border-cyan-400 pl-2 tracking-wider">
                  ギャラリー画像 (Unsplash等 または アップロード)
                </label>
                <button
                  type="button"
                  onClick={() => setMemberGalleryUrls([...memberGalleryUrls, ""])}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  <Plus size={14} /> 画像を追加
                </button>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {memberGalleryUrls.map((url, idx) => (
                  <div key={idx} className="flex gap-3 items-center border border-white/5 p-3 rounded-lg bg-black/20">
                    {/* プレビュー */}
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                      {url ? (
                        <SafeImage src={url} alt={`Gallery Preview ${idx + 1}`} fill className="object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-500">No Image</span>
                      )}
                    </div>
                    {/* コントロール群 */}
                    <div className="flex-grow space-y-1.5 min-w-0">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleGalleryImageFileChange(e, idx)}
                        className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-white/5 file:text-slate-300 hover:file:bg-white/10 file:cursor-pointer"
                      />
                      {(!url || !url.startsWith("data:")) ? (
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...memberGalleryUrls];
                            newUrls[idx] = e.target.value;
                            setMemberGalleryUrls(newUrls);
                          }}
                          className="w-full px-2.5 py-1.5 border border-white/10 rounded bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-xs"
                          placeholder="または画像URLを直接入力..."
                        />
                      ) : (
                        <div className="flex items-center justify-between px-2.5 py-1.5 border border-white/10 rounded bg-cyan-950/20 text-cyan-400 text-xs">
                          <span className="truncate max-w-[200px]">✓ 画像ファイルが選択されています</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newUrls = [...memberGalleryUrls];
                              newUrls[idx] = "";
                              setMemberGalleryUrls(newUrls);
                            }}
                            className="text-pink-500 hover:text-pink-400 font-semibold text-[10px] cursor-pointer"
                          >
                            clear
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMemberGalleryUrls(memberGalleryUrls.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-500 hover:text-rose-400 bg-white/5 hover:bg-white/10 rounded transition cursor-pointer flex-shrink-0"
                      title="この画像を削除"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {memberGalleryUrls.length === 0 && (
                  <p className="text-xs text-slate-500 italic">ギャラリー画像はありません。上のボタンから追加できます。</p>
                )}
              </div>
            </div>

            {/* 代表YouTube動画管理（動的リスト） */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 border-l-2 border-cyan-400 pl-2 tracking-wider">
                  代表動画 (YouTube URL / ID 入力でタイトル自動取得)
                </label>
                <button
                  type="button"
                  onClick={() => setMemberMovies([...memberMovies, { youtubeId: "", title: "" }])}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  <Plus size={14} /> 動画を追加
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {memberMovies.map((m, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={m.youtubeId}
                      onChange={(e) => handleMovieUrlOrIdChange(e.target.value, idx)}
                      className="flex-grow md:flex-initial md:w-80 px-2 py-1.5 border border-white/10 rounded bg-black/40 text-white text-xs"
                      placeholder="YouTube URL または ID (例: https://youtu.be/...)"
                    />
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => {
                          const newMovies = [...memberMovies];
                          newMovies[idx].title = e.target.value;
                          setMemberMovies(newMovies);
                        }}
                        className="w-full px-2 py-1.5 pr-8 border border-white/10 rounded bg-black/40 text-white text-xs"
                        placeholder={fetchingMovieIdxs[idx] ? "タイトル自動取得中..." : "動画タイトル (自動取得可)"}
                        disabled={fetchingMovieIdxs[idx]}
                      />
                      {fetchingMovieIdxs[idx] && (
                        <div className="absolute right-2.5 top-2">
                          <Loader2 size={12} className="animate-spin text-cyan-400" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMemberMovies(memberMovies.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {memberMovies.length === 0 && (
                  <p className="text-xs text-slate-500 italic">動画はありません。上のボタンから追加できます。</p>
                )}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-5 py-2.5 border border-white/10 hover:border-white/20 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-white/5 transition cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-pink-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> 保存中...
                  </>
                ) : (
                  <>
                    <Save size={14} /> 保存する
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingNews && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-pink-500" />
              {editingNews.id ? "ニュース記事を編集" : "新規ニュース作成"}
            </h2>
            <button
              onClick={() => setEditingNews(null)}
              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveNews} className="space-y-6">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ニュースタイトル *</label>
                  <input
                    type="text"
                    required
                    value={editingNews.title || ""}
                    onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-pink-500/50 text-sm"
                    placeholder="夏の24時間ゲーム耐久生放送決定！"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">URLスラッグ (英数字・ハイフン) *</label>
                  <input
                    type="text"
                    required
                    value={editingNews.slug || ""}
                    onChange={(e) => setEditingNews({ ...editingNews, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-pink-500/50 text-sm"
                    placeholder="summer-24h-stream"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs text-slate-400 font-bold">サムネイル画像</label>
                  <div className="flex gap-3 items-center">
                    <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                      {editingNews.thumbnail ? (
                        <SafeImage src={editingNews.thumbnail} alt="Thumbnail Preview" fill className="object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-500">No Image</span>
                      )}
                    </div>
                    <div className="flex-grow space-y-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleNewsThumbnailFileChange}
                        className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-white/5 file:text-slate-300 hover:file:bg-white/10 file:cursor-pointer"
                      />
                      {(!editingNews.thumbnail || !editingNews.thumbnail.startsWith("data:")) ? (
                        <input
                          type="text"
                          value={editingNews.thumbnail || ""}
                          onChange={(e) => setEditingNews({ ...editingNews, thumbnail: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-white/10 rounded bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-pink-500/50 text-xs"
                          placeholder="または画像URLを直接入力..."
                        />
                      ) : (
                        <div className="flex items-center justify-between px-2.5 py-1.5 border border-white/10 rounded bg-pink-950/20 text-pink-400 text-xs">
                          <span className="truncate max-w-[200px]">✓ 画像ファイルが選択されています</span>
                          <button
                            type="button"
                            onClick={() => setEditingNews({ ...editingNews, thumbnail: "" })}
                            className="text-pink-500 hover:text-pink-400 font-semibold text-[10px] cursor-pointer"
                          >
                            クリア
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={editingNews.published ?? true}
                    onChange={(e) => setEditingNews({ ...editingNews, published: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-pink-500 focus:ring-pink-500"
                  />
                  <label htmlFor="published" className="text-xs text-slate-300 font-bold select-none cursor-pointer">
                    公開状態にする (チェックを外すと下書き保存)
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400">記事本文 (Markdown対応) *</label>
                <textarea
                  value={editingNews.content || ""}
                  onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                  rows={10}
                  required
                  className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-white font-mono focus:outline-none focus:ring-1 focus:ring-pink-500/50 text-xs leading-relaxed"
                  placeholder="### 記事の見出し&#10;&#10;ここに本文を記述します。Markdown形式が使えます。"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => setEditingNews(null)}
                className="px-5 py-2.5 border border-white/10 hover:border-white/20 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-white/5 transition cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-pink-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> 保存中...
                  </>
                ) : (
                  <>
                    <Save size={14} /> 保存する
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* リスト表示（フォームが開いていないとき、またはフォームの下に配置） */}
      {!editingMember && !editingNews && (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
          {activeTab === "members" ? (
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white">メンバー一覧</h2>
                  <p className="text-xs text-slate-400">現在ポータルサイトに掲載されているメンバー</p>
                </div>
                <button
                  onClick={startAddMember}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition rounded-lg text-xs font-bold text-black cursor-pointer"
                >
                  <Plus size={14} /> メンバーを追加
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-bold text-slate-400">
                      <th className="py-3 px-4">アイコン</th>
                      <th className="py-3 px-4">名前 / スラッグ</th>
                      <th className="py-3 px-4">好きなゲーム</th>
                      <th className="py-3 px-4">カラー</th>
                      <th className="py-3 px-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {initialMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                            {member.iconImage ? (
                              <SafeImage src={member.iconImage} alt={member.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs">No Image</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{member.name}</div>
                          <div className="text-xs text-slate-400">{member.slug}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-300 max-w-[200px] truncate">
                          {member.favoriteGame}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: member.color }}
                            />
                            <span className="font-mono text-xs text-slate-400">{member.color}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEditMember(member)}
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                              title="編集"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id, member.name, member.slug)}
                              className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                              title="削除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {initialMembers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-slate-500 italic">
                          メンバーが登録されていません。上のボタンから登録してください。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white">ニュース一覧</h2>
                  <p className="text-xs text-slate-400">現在ポータルサイトに掲載されているニュース</p>
                </div>
                <button
                  onClick={startAddNews}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition rounded-lg text-xs font-bold text-black cursor-pointer"
                >
                  <Plus size={14} /> ニュースを作成
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-bold text-slate-400">
                      <th className="py-3 px-4">状態</th>
                      <th className="py-3 px-4">タイトル / スラッグ</th>
                      <th className="py-3 px-4">投稿日</th>
                      <th className="py-3 px-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {initialNews.map((news) => (
                      <tr key={news.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          {news.published ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              公開中
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                              下書き
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white max-w-[400px] truncate">{news.title}</div>
                          <div className="text-xs text-slate-400 font-mono">{news.slug}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {new Date(news.createdAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEditNews(news)}
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                              title="編集"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteNews(news.id, news.title, news.slug)}
                              className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                              title="削除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {initialNews.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-slate-500 italic">
                          ニュースが登録されていません。上のボタンから作成してください。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
