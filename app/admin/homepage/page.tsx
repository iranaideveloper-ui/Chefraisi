'use client';

import { useState } from 'react';

interface HomeBanner {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
}

export default function AdminHomepage() {
  const [banner, setBanner] = useState<HomeBanner>({
    title: 'فراز برتر رامونا',
    subtitle: 'مشاوره، طراحی، آموزش و راه‌اندازی رستوران‌ها صفر تا صد',
    description: 'با تیم متخصص ما، رویای کسب‌وکار خود را به واقعیت تبدیل کنید',
    backgroundImage: '/banner.jpg',
    ctaText: 'شروع کنید',
    ctaLink: '#consultation'
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: string) => {
    setBanner(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('homeBanner', JSON.stringify(banner));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">مدیریت صفحه خانه</h1>
      
      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          ✓ صفحه خانه با موفقیت بروزرسانی شد
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 این بخش شامل تنظیمات بنر و متن اصلی صفحه خانه است
          </p>
        </div>

        {/* بنر */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">بنر اصلی</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">عنوان اصلی</label>
              <input
                type="text"
                value={banner.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">زیرعنوان</label>
              <input
                type="text"
                value={banner.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">توضیح</label>
              <textarea
                value={banner.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">آدرس تصویر پس‌زمینه</label>
              <input
                type="text"
                value={banner.backgroundImage}
                onChange={(e) => handleChange('backgroundImage', e.target.value)}
                placeholder="/banner.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">متن دکمه</label>
                <input
                  type="text"
                  value={banner.ctaText}
                  onChange={(e) => handleChange('ctaText', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">لینک دکمه</label>
                <input
                  type="text"
                  value={banner.ctaLink}
                  onChange={(e) => handleChange('ctaLink', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* بخش‌های دیگر */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium">📝 بخش‌های دیگری که می‌توانند اضافه شوند:</p>
          <ul className="mt-3 space-y-2 text-sm text-yellow-700">
            <li>✓ مدیریت بخش مزایا</li>
            <li>✓ مدیریت شهادات و نظرات کاربران</li>
            <li>✓ مدیریت بخش تماس</li>
            <li>✓ مدیریت فوتر</li>
          </ul>
        </div>

        {/* دکمه‌ها */}
        <div className="border-t pt-6 flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            ذخیره تغییرات
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            بازگشت
          </button>
        </div>
      </div>
    </div>
  );
}
