"use client";

import { useRef, useState } from "react";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  recommendedDimensions?: { width: number; height: number };
};

export default function ImageUpload({ value, onChange, label = "تصویر", recommendedDimensions }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setUploading(true); setError("");
    try {
      if (recommendedDimensions) {
        const image = new window.Image();
        const imageUrl = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("خواندن ابعاد تصویر انجام نشد"));
          image.src = imageUrl;
        });
        URL.revokeObjectURL(imageUrl);
        const recommendedRatio = recommendedDimensions.width / recommendedDimensions.height;
        const imageRatio = image.naturalWidth / image.naturalHeight;
        if (Math.abs(imageRatio - recommendedRatio) > 0.25) {
          throw new Error("نسبت تصویر باید نزدیک به ۳:۲ باشد؛ اندازه دقیق پیکسل الزامی نیست");
        }
      }
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body, credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "آپلود تصویر انجام نشد");
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "آپلود تصویر انجام نشد");
    } finally { setUploading(false); }
  };

  return <div className="space-y-2"><span className="block text-sm font-semibold text-gray-700">{label}</span><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[#d4af37] disabled:opacity-50">{uploading ? "در حال آپلود..." : "انتخاب تصویر از سیستم"}</button><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />{value && <span className="max-w-full truncate text-xs text-gray-500" dir="ltr">{value}</span>}</div>{value && <img src={value} alt="پیش‌نمایش تصویر" className="h-28 w-full rounded-lg bg-gray-100 object-contain" />}{error && <p className="text-xs text-red-600">{error}</p>}<p className="text-xs text-gray-400">JPG، PNG یا WebP، حداکثر ۵ مگابایت</p>{recommendedDimensions && <p className="text-xs font-semibold text-blue-600">اندازه پیشنهادی: {recommendedDimensions.width} × {recommendedDimensions.height} پیکسل (نسبت ۳:۲)؛ اندازه دقیق پیکسل الزامی نیست</p>}</div>;
}
