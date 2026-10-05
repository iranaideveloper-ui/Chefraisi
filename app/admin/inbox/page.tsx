"use client";

import { useEffect, useState } from "react";
import { Inbox, RefreshCw, Trash2 } from "lucide-react";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type InboxComment = {
  _id: string;
  consultationName: string;
  consultationPhone: string;
  consultationType: string;
  authorName: string;
  authorRole: "admin" | "super_admin";
  comment: string;
  createdAt: string;
};

export default function AdminInboxPage() {
  const confirm = useConfirmDialog();
  const [comments, setComments] = useState<InboxComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadComments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/consultation-comments", { credentials: "include", cache: "no-store" });
      const result = await response.json() as { comments?: InboxComment[]; error?: string };
      if (!response.ok) throw new Error(result.error || "دریافت یادداشت‌ها انجام نشد");
      setComments(result.comments || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "دریافت یادداشت‌ها انجام نشد");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadComments(); }, []);

  const deleteComment = async (comment: InboxComment) => {
    if (!await confirm({ title: "حذف یادداشت", description: `یادداشت مربوط به درخواست ${comment.consultationName} حذف شود؟` })) return;
    setDeletingId(comment._id);
    setError("");
    try {
      const response = await fetch("/api/admin/consultation-comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: comment._id }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "حذف یادداشت انجام نشد");
      setComments((current) => current.filter((item) => item._id !== comment._id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "حذف یادداشت انجام نشد");
    } finally {
      setDeletingId(null);
    }
  };

  return <div className="space-y-6">
    <section className="rounded-xl bg-white p-5 shadow sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">صندوق یادداشت‌های مدیران</h1>
          <p className="mt-1 text-sm text-gray-500">یادداشت‌های داخلی ثبت‌شده برای پیگیری درخواست‌های مشاوره</p>
        </div>
        <button type="button" onClick={() => void loadComments()} disabled={loading} aria-label="تازه‌سازی صندوق" title="تازه‌سازی صندوق" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="py-12 text-center text-sm text-gray-500">در حال دریافت یادداشت‌ها...</p> : comments.length === 0 ? <div className="rounded-lg border border-dashed border-gray-300 py-14 text-center text-gray-500"><Inbox className="mx-auto mb-3 h-8 w-8 text-gray-400" /><p className="font-semibold">صندوق یادداشتی ندارد.</p></div> : <div className="space-y-3">
        {comments.map((item) => <article key={item._id} className="rounded-lg border border-gray-200 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-bold text-gray-800">{item.consultationName}</h2>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                <span dir="ltr">{item.consultationPhone}</span>
                <span>{item.consultationType}</span>
              </div>
            </div>
            <button type="button" onClick={() => void deleteComment(item)} disabled={deletingId === item._id} aria-label="حذف یادداشت" title="حذف یادداشت" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:opacity-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm leading-7 text-gray-800">{item.comment}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <span>ثبت‌شده توسط {item.authorName}{item.authorRole === "super_admin" ? " (مدیر ارشد)" : " (مدیر)"}</span>
            <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("fa-IR")}</time>
          </div>
        </article>)}
      </div>}
    </section>
  </div>;
}
