"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { BookOpen, Clock3, Pencil, Plus, Trash2, X } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminRole } from "@/components/admin/useAdminRole";

type ArticleCategory = "launch" | "cooking" | "design" | "management" | "equipment" | "franchise";

type ArticleRecord = {
  _id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  readingTime: number;
  excerpt: string;
  content: string;
  image: string;
  published: boolean;
  createdAt: string;
};

type ArticleForm = Omit<ArticleRecord, "_id" | "slug" | "createdAt">;

const categoryOptions: { value: ArticleCategory; label: string }[] = [
  { value: "launch", label: "راه‌اندازی رستوران" },
  { value: "cooking", label: "آموزش آشپزی" },
  { value: "design", label: "آیا می‌دانید" },
  { value: "management", label: "مدیریت و بیزینس" },
  { value: "equipment", label: "تجهیزات آشپزخانه" },
  { value: "franchise", label: "فرانچایز" },
];

const emptyForm: ArticleForm = {
  title: "",
  category: "launch",
  readingTime: 5,
  excerpt: "",
  content: "",
  image: "",
  published: true,
};

const inputClass = "mt-1 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20";

export default function AdminArticlesPage() {
  const confirm = useConfirmDialog();
  const isSuperAdmin = useAdminRole();
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  const loadArticles = async () => {
    try {
      const response = await fetch("/api/admin/articles", { credentials: "include", cache: "no-store" });
      const result = await response.json() as { articles?: ArticleRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "دریافت مقالات انجام نشد");
      setArticles(result.articles ?? []);
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "دریافت مقالات انجام نشد", success: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadArticles(); }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveArticle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(editingId ? `/api/admin/articles/${editingId}` : "/api/admin/articles", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, readingTime: Number(form.readingTime), published: isSuperAdmin && form.published }),
      });
      const result = await response.json() as { article?: ArticleRecord; error?: string };
      if (!response.ok) throw new Error(result.error || "ذخیره مقاله انجام نشد");
      if (!result.article) throw new Error("پاسخ ذخیره مقاله نامعتبر است");
      const savedArticle = result.article;
      setArticles((current) => editingId
        ? current.map((article) => article._id === editingId ? savedArticle : article)
        : [savedArticle, ...current]);
      setToast({ message: editingId ? "مقاله با موفقیت ویرایش شد" : "مقاله با موفقیت ثبت شد", success: true });
      closeForm();
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "ذخیره مقاله انجام نشد", success: false });
    } finally {
      setSaving(false);
    }
  };

  const editArticle = (article: ArticleRecord) => {
    setEditingId(article._id);
    setForm({
      title: article.title,
      category: article.category,
      readingTime: article.readingTime,
      excerpt: article.excerpt,
      content: article.content,
      image: article.image,
      published: article.published,
    });
    setFormOpen(true);
  };

  const deleteArticle = async (article: ArticleRecord) => {
    const approved = await confirm({
      title: "حذف مقاله",
      description: `مقاله «${article.title}» حذف می‌شود و امکان بازگردانی آن وجود ندارد.`,
    });
    if (!approved) return;
    try {
      const response = await fetch(`/api/admin/articles/${article._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "حذف مقاله انجام نشد");
      setArticles((current) => current.filter((item) => item._id !== article._id));
      setToast({ message: "مقاله حذف شد", success: true });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "حذف مقاله انجام نشد", success: false });
    }
  };

  const seedDefaultArticles = async () => {
    setSeeding(true);
    try {
      const response = await fetch("/api/admin/articles/seed", {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json() as {
        insertedCount?: number;
        skippedCount?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "درون‌ریزی مقالات اولیه انجام نشد");
      await loadArticles();
      setToast({
        message: result.insertedCount
          ? `${result.insertedCount} مقاله اضافه شد؛ ${result.skippedCount ?? 0} مقاله تکراری رد شد.`
          : `مقاله جدیدی اضافه نشد؛ ${result.skippedCount ?? 0} مقاله از قبل وجود داشت.`,
        success: true,
      });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "درون‌ریزی مقالات اولیه انجام نشد", success: false });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-4 shadow sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">مدیریت مقالات</h1>
            <p className="mt-1 text-sm text-gray-500">ساخت، ویرایش و انتشار مقالات سایت</p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingId(null); setForm({ ...emptyForm, published: isSuperAdmin }); setFormOpen(true); }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-bold text-gray-950 transition hover:bg-[#c5a12e]"
          >
            <Plus className="h-4 w-4" /> افزودن مقاله جدید
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-500">در حال دریافت مقالات...</p>
        ) : articles.length === 0 ? (
          <div className="py-14 text-center text-gray-500">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-[#b8962e]" />
            <p className="font-semibold">هنوز مقاله‌ای ثبت نشده است.</p>
            {isSuperAdmin && <button
              type="button"
              onClick={() => void seedDefaultArticles()}
              disabled={seeding}
              className="mt-4 min-h-10 rounded-lg border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#806414] transition hover:bg-[#d4af37]/10 disabled:cursor-wait disabled:opacity-60"
            >
              {seeding ? "در حال درون‌ریزی..." : "درون‌ریزی مقالات اولیه"}
            </button>}
          </div>
        ) : (
          <>
            <div className="mt-6 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-right text-sm">
                <thead className="border-y border-gray-200 bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-3 py-3 font-semibold">مقاله</th>
                    <th className="px-3 py-3 font-semibold">دسته‌بندی</th>
                    <th className="px-3 py-3 font-semibold">زمان مطالعه</th>
                    <th className="px-3 py-3 font-semibold">تاریخ</th>
                    <th className="px-3 py-3 font-semibold">وضعیت</th>
                    {isSuperAdmin && <th className="px-3 py-3 font-semibold">عملیات</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map((article) => (
                    <tr key={article._id} className="hover:bg-gray-50/70">
                      <td className="px-3 py-3">
                        <div className="flex min-w-60 items-center gap-3">
                          {article.image ? <Image src={article.image} alt="" width={72} height={52} unoptimized className="h-13 w-18 shrink-0 rounded object-cover" /> : <div className="flex h-13 w-18 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400"><BookOpen className="h-5 w-5" /></div>}
                          <span className="font-semibold leading-6 text-gray-800">{article.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><CategoryBadge category={article.category} /></td>
                      <td className="px-3 py-3 text-gray-600">{article.readingTime} دقیقه</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600">{formatDate(article.createdAt)}</td>
                      <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${article.published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{article.published ? "منتشرشده" : "پیش‌نویس"}</span></td>
                      {isSuperAdmin && <td className="px-3 py-3"><ArticleActions onEdit={() => editArticle(article)} onDelete={() => void deleteArticle(article)} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 space-y-3 md:hidden">
              {articles.map((article) => (
                <article key={article._id} className="border border-gray-200 bg-gray-50 p-3">
                  <div className="flex gap-3">
                    {article.image ? <Image src={article.image} alt="" width={88} height={68} unoptimized className="h-[68px] w-[88px] shrink-0 rounded object-cover" /> : <div className="flex h-[68px] w-[88px] shrink-0 items-center justify-center rounded bg-gray-200 text-gray-400"><BookOpen className="h-5 w-5" /></div>}
                    <div className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 font-bold leading-6 text-gray-800">{article.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2"><CategoryBadge category={article.category} /><span className="inline-flex items-center gap-1 text-xs text-gray-500"><Clock3 className="h-3.5 w-3.5" />{article.readingTime} دقیقه</span></div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                    <div className="flex items-center gap-2"><span className="text-xs text-gray-500">{formatDate(article.createdAt)}</span><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${article.published ? "bg-green-50 text-green-700" : "bg-gray-200 text-gray-600"}`}>{article.published ? "منتشرشده" : "پیش‌نویس"}</span></div>
                    {isSuperAdmin && <ArticleActions onEdit={() => editArticle(article)} onDelete={() => void deleteArticle(article)} />}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-gray-950/60 p-3 py-6 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) closeForm(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="article-form-title" className="my-auto w-full max-w-3xl rounded-xl border border-[#d4af37]/35 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2 id="article-form-title" className="text-lg font-bold text-gray-800">{editingId ? "ویرایش مقاله" : "افزودن مقاله جدید"}</h2>
              <button type="button" onClick={closeForm} disabled={saving} aria-label="بستن فرم" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={saveArticle} className="space-y-4 p-4 sm:p-6">
              <label className="block text-sm font-semibold text-gray-700">عنوان مقاله
                <input className={inputClass} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} maxLength={100} required />
                <span className="mt-1 block text-xs text-neutral-400">{form.title.length}/100</span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-gray-700">دسته‌بندی
                  <select className={inputClass} value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ArticleCategory }))}>
                    {categoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-gray-700">زمان تقریبی مطالعه (دقیقه)
                  <input className={inputClass} type="number" min={1} max={180} maxLength={20} value={form.readingTime} onChange={(event) => { const value = event.target.value; if (value.length <= 20) setForm((current) => ({ ...current, readingTime: Number(value) })); }} required />
                  <span className="mt-1 block text-xs text-neutral-400">{String(form.readingTime).length}/20</span>
                </label>
              </div>
              <label className="block text-sm font-semibold text-gray-700">تصویر شاخص (نشانی تصویر)
                <input className={inputClass} type="text" dir="ltr" placeholder="https://... یا /uploads/..." value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} />
              </label>
              <ImageUpload label="یا بارگذاری تصویر از دستگاه" value={form.image} onChange={(image) => setForm((current) => ({ ...current, image }))} />
              <label className="block text-sm font-semibold text-gray-700">چکیده / خلاصه کوتاه
                <textarea className={`${inputClass} min-h-24 resize-y`} value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} maxLength={180} rows={3} />
                <span className="mt-1 block text-xs text-neutral-400">{form.excerpt.length}/180</span>
              </label>
              <label className="block text-sm font-semibold text-gray-700">متن کامل مقاله
                <textarea className={`${inputClass} min-h-56 resize-y leading-7`} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} rows={8} required />
                <span className="mt-1 block text-xs text-neutral-400">{form.content.length} کاراکتر</span>
              </label>
              {isSuperAdmin && <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-700">
                <input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} className="h-4 w-4 accent-[#d4af37]" /> انتشار مقاله
              </label>}
              <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
                <button type="button" onClick={closeForm} disabled={saving} className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">انصراف</button>
                <button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-[#d4af37] px-5 py-2 text-sm font-bold text-gray-950 transition hover:bg-[#c5a12e] disabled:cursor-wait disabled:opacity-60">{saving ? "در حال ذخیره..." : "ذخیره مقاله"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && <div role="status" className={`fixed bottom-5 left-4 z-[90] max-w-[calc(100vw-2rem)] border px-4 py-3 text-sm font-semibold shadow-lg ${toast.success ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{toast.message}</div>}
    </div>
  );
}

function CategoryBadge({ category }: { category: ArticleCategory }) {
  const label = categoryOptions.find((option) => option.value === category)?.label ?? category;
  return <span className="rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 px-2.5 py-1 text-[11px] font-semibold text-[#806414]">{label}</span>;
}

function ArticleActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return <div className="flex items-center gap-1">
    <button type="button" onClick={onEdit} aria-label="ویرایش مقاله" title="ویرایش مقاله" className="flex h-10 w-10 items-center justify-center rounded-lg text-blue-700 transition hover:bg-blue-50"><Pencil className="h-4 w-4" /></button>
    <button type="button" onClick={onDelete} aria-label="حذف مقاله" title="حذف مقاله" className="flex h-10 w-10 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
  </div>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fa-IR");
}