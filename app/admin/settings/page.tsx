'use client';

import { useEffect, useState } from 'react';
import LinksQrCodeCard from '@/components/admin/LinksQrCodeCard';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'فراز برتر رامونا',
    siteDescription: 'مشاوره، طراحی، آموزش و راه‌اندازی رستوران‌ها صفر تا صد',
    phone: '۰۲۱-۱۲۳۴۵۶۷۸',
    email: 'info@farazbetar.ir',
    address: 'تهران، خیابان ولیعصر',
    instagram: 'https://instagram.com/farazbetar',
    whatsapp: '۰۹۱۲۱۲۳۴۵۶۷',
    bale: 'https://bale.ai/',
    instagramUrl: 'https://instagram.com/fermo_cafe',
    baleUrl: 'https://bale.ai/',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=35.7196944,51.3623611',
    mapEmbedUrl: 'https://www.google.com/maps?q=35.7196944,51.3623611&hl=fa&z=16&output=embed',
    baladUrl: 'https://balad.ir/p/rbvkLS_x4QW8?preview=true#15/35.720/51.363',
    neshanUrl: 'https://neshan.org/maps/places/rbvkLS_x4QW8#c35.720-51.363',
    catalogPdfUrl: '',
    adminFirstName: '',
    adminLastName: '',
    adminMobile: '',
    newPassword: '',
    currency: 'تومان',
    language: 'fa',
    timezone: 'Asia/Tehran',
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingCatalog, setUploadingCatalog] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include', cache: 'no-store' })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || 'دریافت تنظیمات انجام نشد'); return result; })
      .then((result) => setSettings((current) => ({ ...current, ...result.settings, ...result.admin, adminFirstName: result.admin?.firstName || '', adminLastName: result.admin?.lastName || '', adminMobile: result.admin?.mobile || '' })))
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleCatalogUpload = async (file: File) => {
    setMessage(''); setUploadingCatalog(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/admin/settings/catalog', { method: 'POST', body, credentials: 'include' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'آپلود کاتالوگ انجام نشد');
      handleChange('catalogPdfUrl', result.url);
      setMessage('فایل کاتالوگ آپلود شد؛ برای ثبت نهایی روی «ذخیره تنظیمات» کلیک کنید.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'آپلود کاتالوگ انجام نشد');
    } finally {
      setUploadingCatalog(false);
    }
  };

  const handleSave = async () => {
    setSaved(false); setMessage(''); setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(settings) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || 'ذخیره تنظیمات انجام نشد'); return; }
      setSettings((current) => ({ ...current, ...result.settings, adminFirstName: result.admin?.firstName || current.adminFirstName, adminLastName: result.admin?.lastName || current.adminLastName, adminMobile: result.admin?.mobile || current.adminMobile, newPassword: '' }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setMessage('ارتباط با سرور برای ذخیره تنظیمات برقرار نشد');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow">در حال بارگذاری تنظیمات...</div>;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">تنظیمات سایت</h1>
      
      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          ✓ تنظیمات با موفقیت ذخیره شدند
        </div>
      )}
      {message && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">{message}</div>}

      <div className="space-y-6">
        {/* اطلاعات عمومی */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات عمومی</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام سایت</label>
              <input
                type="text"
                maxLength={80}
                readOnly
                disabled
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">توضیح سایت</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                rows={3}
                maxLength={200}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">زبان</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">منطقه‌زمانی</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Asia/Tehran">تهران (UTC+3:30)</option>
                  <option value="Asia/Dubai">دبی (UTC+4)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">اطلاعات مدیر ارشد سایت</h3>
          <p className="mb-4 text-sm text-gray-500">نام کاربری مدیر ارشد همان شماره همراه اوست. رمز فعلی نمایش داده نمی‌شود.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-2 block text-sm font-medium text-gray-700">نام مدیر</label><input value={settings.adminFirstName} onChange={(e) => handleChange('adminFirstName', e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="mb-2 block text-sm font-medium text-gray-700">نام خانوادگی مدیر</label><input value={settings.adminLastName} onChange={(e) => handleChange('adminLastName', e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="mb-2 block text-sm font-medium text-gray-700">نام کاربری / شماره همراه</label><input type="tel" dir="ltr" value={settings.adminMobile} onChange={(e) => handleChange('adminMobile', e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="mb-2 block text-sm font-medium text-gray-700">رمز عبور جدید</label><input type="password" dir="ltr" value={settings.newPassword} onChange={(e) => handleChange('newPassword', e.target.value)} placeholder="در صورت نیاز وارد کنید" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" /></div>
          </div>
        </div>

        {/* اطلاعات تماس */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات تماس</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شماره تلفن</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">بله</label>
              <input type="url" value={settings.bale} onChange={(e) => handleChange('bale', e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">آدرس</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">واتس‌اپ</label>
              <input
                type="tel"
                value={settings.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* شبکه‌های اجتماعی */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">شبکه‌های اجتماعی</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">واتساپ</label>
              <input
                type="tel"
                value={settings.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اینستاگرام</label>
              <input
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">لینک پشتیبانی در بله</label>
              <input
                type="url"
                value={settings.baleUrl}
                onChange={(e) => handleChange('baleUrl', e.target.value)}
                placeholder="https://bale.ai/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">لینک گوگل مپ دفتر</label>
              <input
                type="url"
                value={settings.mapUrl}
                onChange={(e) => handleChange('mapUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">لینک نمایش نقشه گوگل داخل سایت (Embed)</label>
              <input
                type="url"
                value={settings.mapEmbedUrl}
                onChange={(e) => handleChange('mapEmbedUrl', e.target.value)}
                placeholder="https://www.google.com/maps?q=...&output=embed"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-xs text-gray-400">این لینک باید از نوع Google Maps Embed باشد؛ لینک مشاهده و لینک نمایش داخل سایت جدا هستند.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">لینک دفتر در بلد</label>
              <input
                type="url"
                value={settings.baladUrl}
                onChange={(e) => handleChange('baladUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">لینک دفتر در نشان</label>
              <input
                type="url"
                value={settings.neshanUrl}
                onChange={(e) => handleChange('neshanUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">لینک فایل کاتالوگ PDF</label>
              <input
                type="url"
                value={settings.catalogPdfUrl}
                onChange={(e) => handleChange('catalogPdfUrl', e.target.value)}
                placeholder="https://.../catalog.pdf"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#d4af37] hover:text-[#8a6d18] has-disabled:cursor-not-allowed has-disabled:opacity-50">
                  {uploadingCatalog ? 'در حال آپلود...' : 'آپلود فایل PDF'}
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    disabled={uploadingCatalog}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleCatalogUpload(file);
                      event.target.value = '';
                    }}
                  />
                </label>
                {settings.catalogPdfUrl && (
                  <a href={settings.catalogPdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    مشاهده فایل فعلی
                  </a>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-400">فقط PDF، حداکثر ۱۰ مگابایت. پس از آپلود، ذخیره تنظیمات را بزنید.</p>
            </div>
          </div>
        </div>

        {/* دکمه ذخیره */}
        <div className="border-t pt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
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
      <LinksQrCodeCard />
    </>
  );
}
