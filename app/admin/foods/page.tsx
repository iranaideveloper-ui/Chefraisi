"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type Food = {
  id: string;
  name: string;
  ingredients: string;
  price: number;
  image?: string; // local object url or base64 preview
};

export default function FoodsPage() {
  const confirm = useConfirmDialog();
  const [foods, setFoods] = useState<Food[]>([
    {
      id: "1",
      name: "خوراک مخصوص",
      ingredients: "گوشت، پیاز، فلفل، رب گوجه",
      price: 120000,
      image: undefined,
    },
    {
      id: "2",
      name: "پاستا آلفردو",
      ingredients: "پاستا، سس آلفردو، پنیر",
      price: 90000,
      image: undefined,
    },
  ]);

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function resetForm() {
    setName("");
    setIngredients("");
    setPrice("");
    setImageFile(null);
    setImagePreview(undefined);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // basic validation
    if (!name.trim()) return alert("لطفا نام غذا را وارد کنید");
    if (!ingredients.trim()) return alert("لطفا محتویات را وارد کنید");
    const parsedPrice = Number(price);
    if (!price || Number.isNaN(parsedPrice) || parsedPrice <= 0)
      return alert("لطفا قیمت معتبر وارد کنید");

    setIsSubmitting(true);

    // simulate upload: create a local preview string (in real app you'd upload file and get URL)
    let imageUrl: string | undefined = undefined;
    if (imageFile) {
      // read file as data URL (small files only) to simulate upload preview
      imageUrl = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(String(reader.result));
        reader.onerror = () => rej(new Error("file-read-error"));
        reader.readAsDataURL(imageFile);
      });
    }

    // fake API delay
    await new Promise((r) => setTimeout(r, 700));

    const newFood: Food = {
      id: String(Date.now()),
      name: name.trim(),
      ingredients: ingredients.trim(),
      price: parsedPrice,
      image: imageUrl ?? undefined,
    };

    setFoods((s) => [newFood, ...s]);
    resetForm();
    setIsSubmitting(false);
    // In a real app: send to server with fetch('/api/admin/foods', {method: 'POST', body: formData})
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">مدیریت غذاها</h1>
        <p className="text-sm text-muted-foreground">لیست غذاها و افزودن غذای جدید</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="col-span-1 bg-gray rounded-lg shadow-xl p-4">
          <h2 className="text-lg font-medium mb-3">افزودن غذای جدید</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm">نام غذا</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring"
                placeholder="مثال: کباب برگ"
              />
            </div>

            <div>
              <label className="block text-sm">محتویات / توضیحات</label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring"
                rows={4}
                placeholder="مواد تشکیل‌دهنده، نکات سرو"
              />
            </div>

            <div>
              <label className="block text-sm">قیمت (تومان)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring"
                placeholder="مثال: 120000"
              />
            </div>

            <div>
              <label className="block text-sm">تصویر غذا</label>
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
                {isSubmitting ? "در حال ارسال..." : "افزودن"}
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
            <h2 className="text-lg font-medium mb-3">لیست غذاها ({foods.length})</h2>

            <div className="space-y-3">
              {foods.map((f) => (
                <div key={f.id} className="flex shadow items-center gap-4 border rounded p-3">
                  <div className="w-20 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {f.image ? (
                      <Image src={f.image} alt={f.name} width={80} height={64} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <div className="text-xs text-gray-500">بدون تصویر</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{f.name}</h3>
                      <div className="text-sm text-gray-600">{f.price.toLocaleString()} تومان</div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{f.ingredients}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        // simple client-side delete
                        if (await confirm({ title: "حذف غذا", description: "این غذا حذف می‌شود و امکان بازگردانی آن وجود ندارد." })) {
                          setFoods((s) => s.filter((x) => x.id !== f.id));
                        }
                      }}
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
