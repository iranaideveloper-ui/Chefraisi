"use client";

import React from "react";

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[92%] max-w-md bg-white/90 dark:bg-gray-900/90 rounded-xl p-4 shadow-lg border border-white/30">
        <div className="flex items-center gap-2">
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none p-2 text-base"
            placeholder="جستجو کنید..."
            aria-label="search"
          />
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
          >
            بستن
          </button>
        </div>

        <div className="mt-3 text-sm text-gray-500">نتیجه‌ای فعلاً وجود ندارد — این یک نمونهٔ مودال جستجو است.</div>
      </div>
    </div>
  );
}
