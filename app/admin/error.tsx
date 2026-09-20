'use client';

export default function AdminError() {
  return (
    <div className="viewport-min-height flex items-center justify-center overflow-x-hidden bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">⚠️</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">خطای دسترسی</h2>
        <p className="text-gray-600 mb-6">شما دسترسی به این بخش ندارید</p>
        <a
          href="/admin"
          className="inline-block px-6 py-2 bg-[#d4af37] text-white rounded-lg hover:bg-yellow-600 transition font-medium"
        >
          بازگشت به داشبورد
        </a>
      </div>
    </div>
  );
}
