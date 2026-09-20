"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
  description?: string;
  image?: string;
};

// We'll reuse the Food type shape from foods page for mock association display
type Food = {
  id: string;
  name: string;
  price: number;
};

export default function CategoriesPage() {
  const confirm = useConfirmDialog();
  const [categories, setCategories] = useState<Category[]>([
    { id: "c1", name: "پیتزا", parentId: null, description: "انواع پیتزا" },
    { id: "c2", name: "پاستا", parentId: null, description: "پاستاها و نودل" },
    { id: "c3", name: "پیتزا مخصوص", parentId: "c1", description: "زیرمجموعه پیتزا" },
  ]);

  // mock foods to show counts per category (in real app you'd fetch this relation)
  const [foods] = useState<Food[]>([
    { id: "f1", name: "پیتزا مارگارتا", price: 120000 },
    { id: "f2", name: "پیتزا پپرونی", price: 140000 },
    { id: "f3", name: "پاستا آلفردو", price: 90000 },
  ]);

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | "">("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function resetForm() {
    setName("");
    setParentId("");
    setDescription("");
    setImageFile(null);
    setImagePreview(undefined);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    if (!f) {
      setImagePreview(undefined);
      return;
    }
    const url = URL.createObjectURL(f);
    setImagePreview(url);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setParentId(cat.parentId ?? "");
    setDescription(cat.description ?? "");
    setImagePreview(cat.image);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return alert("لطفا نام دسته‌بندی را وارد کنید");

    setIsSubmitting(true);

    let imageUrl: string | undefined = undefined;
    if (imageFile) {
      imageUrl = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(String(reader.result));
        reader.onerror = () => rej(new Error("file-read-error"));
        reader.readAsDataURL(imageFile as Blob);
      });
    }

    await new Promise((r) => setTimeout(r, 500));

    if (editingId) {
      setCategories((s) =>
        s.map((c) => (c.id === editingId ? { ...c, name: name.trim(), parentId: parentId || null, description: description.trim(), image: imageUrl ?? c.image } : c))
      );
    } else {
      const newCat: Category = {
        id: String(Date.now()),
        name: name.trim(),
        parentId: parentId || null,
        description: description.trim() || undefined,
        image: imageUrl ?? undefined,
      };
      setCategories((s) => [newCat, ...s]);
    }

    resetForm();
    setIsSubmitting(false);
  }

  async function handleDelete(cat: Category) {
    // simple check: prevent deleting parent when children exist
    const hasChildren = categories.some((c) => c.parentId === cat.id);
    if (hasChildren) return alert("ابتدا زیردسته‌ها را حذف یا منتقل کنید.");
    if (!await confirm({ title: "حذف دسته‌بندی", description: "این دسته‌بندی حذف می‌شود و امکان بازگردانی آن وجود ندارد." })) return;
    setCategories((s) => s.filter((c) => c.id !== cat.id));
  }

  function countFoodsInCategory(cat: Category) {
    // mock: assume foods with 'پیتزا' belong to pizza categories
    if (cat.name.includes("پیتزا")) return foods.filter((f) => f.name.includes("پیتزا")).length;
    if (cat.name.includes("پاستا")) return foods.filter((f) => f.name.includes("پاستا")).length;
    return 0;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">مدیریت دسته‌بندی‌ها</h1>
        <p className="text-sm text-muted-foreground">لیست دسته‌بندی‌ها و افزودن/ویرایش دسته‌بندی جدید</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="col-span-1 bg-gray rounded-lg shadow-xl p-4">
          <h2 className="text-lg font-medium mb-3">{editingId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm">نام دسته‌بندی</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring"
                placeholder="مثال: پیتزا"
              />
            </div>

            <div>
              <label className="block text-sm">زیرمجموعه از</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring"
              >
                <option value="">— بدون —</option>
                {categories
                  .filter((c) => c.id !== editingId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">توضیحات</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring"
                rows={3}
                placeholder="توضیح مختصر درباره دسته‌بندی"
              />
            </div>

            <div>
              <label className="block text-sm">تصویر دسته‌بندی</label>
              <input
                ref={fileInputRef}
                onChange={handleImageChange}
                type="file"
                accept="image/*"
                className="w-full mt-1"
              />
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">پیش‌نمایش تصویر:</p>
                  <div className="mt-1 w-40 h-28 relative rounded overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="preview"
                      width={160}
                      height={112}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {isSubmitting ? "در حال ارسال..." : editingId ? "ذخیره تغییرات" : "افزودن"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                پاک کردن
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-3">لیست دسته‌بندی‌ها ({categories.length})</h2>

            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c.id} className="flex shadow items-center gap-4 border rounded p-3">
                  <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {c.image ? (
                      <Image src={c.image} alt={c.name} width={112} height={80} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <div className="text-xs text-gray-500">بدون تصویر</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{c.name}</h3>
                        <div className="text-xs text-gray-500">{c.description}</div>
                      </div>
                      <div className="text-sm text-gray-600">{countFoodsInCategory(c)} کالا</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {c.parentId ? (
                        <span>زیرمجموعه: {categories.find((x) => x.id === c.parentId)?.name ?? '—'}</span>
                      ) : (
                        <span>دسته اصلی</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="px-3 py-1 text-sm bg-yellow-400 text-white rounded"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
