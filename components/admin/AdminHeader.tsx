'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiOutlineBars3, HiOutlineBell, HiOutlineUserCircle,
  HiOutlineMagnifyingGlass, HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle, HiOutlineArrowLeft
} from 'react-icons/hi2';

interface AdminHeaderProps { onToggleSidebar: () => void; }
type ConsultationNotification = { _id: string; name: string; family: string; consultationType: string; createdAt: string };

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<ConsultationNotification[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setIsSuperAdmin(data.user?.role === 'super_admin'))
      .catch(() => setIsSuperAdmin(false));
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/admin/consultations?status=pending', { credentials: 'include', cache: 'no-store' });
        if (!response.ok) return;
        const result = await response.json();
        setNotifications((result.consultations || []).slice(0, 5));
      } catch {
        setNotifications([]);
      }
    };
    void loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } finally {
      window.location.assign('/auth');
    }
  };

  return (
    <header className="fixed left-0 top-0 right-0 lg:right-64 h-16 bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <HiOutlineBars3 className="w-6 h-6 text-gray-600" />
          </button>
          <button onClick={() => router.push('/admin')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium text-sm">
            <HiOutlineArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">بازگشت به داشبورد</span>
          </button>
          <div className="hidden sm:flex items-center bg-gray-50 rounded-lg px-3 py-2 w-64">
            <HiOutlineMagnifyingGlass className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" placeholder="جستجو..." className="bg-transparent outline-none text-sm w-full" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
          <button aria-label="اعلان‌های درخواست مشاوره" onClick={() => setShowNotifications((current) => !current)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <HiOutlineBell className="w-6 h-6 text-gray-600" />
            {notifications.length > 0 && <span className="absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{notifications.length}</span>}
          </button>
          {showNotifications && <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3"><div><p className="font-bold text-gray-800">اعلان‌های مشاوره</p><p className="text-xs text-gray-500">درخواست‌های در انتظار بررسی</p></div><span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-600">{notifications.length} جدید</span></div>
            {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-gray-500">اعلان جدیدی وجود ندارد.</p> : <div className="max-h-72 overflow-y-auto">{notifications.map((item) => <button key={item._id} onClick={() => { setShowNotifications(false); router.push('/admin/consultations'); }} className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-right transition hover:bg-amber-50"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" /><span className="min-w-0"><strong className="block truncate text-sm text-gray-800">درخواست جدید از {item.name} {item.family}</strong><span className="mt-1 block truncate text-xs text-gray-500">{item.consultationType} · {new Date(item.createdAt).toLocaleDateString('fa-IR')}</span></span></button>)}</div>}
            <button onClick={() => { setShowNotifications(false); router.push('/admin/consultations'); }} className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-50">مشاهده همه درخواست‌ها <HiOutlineArrowLeft className="h-4 w-4" /></button>
          </div>}
          </div>
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">مدیر سیستم</p>
                <p className="text-xs text-gray-500">admin@fermo.com</p>
              </div>
              <HiOutlineUserCircle className="w-8 h-8 text-gray-600" />
            </button>
            {showProfileMenu && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                {isSuperAdmin && <button onClick={() => router.push('/admin/settings')} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <HiOutlineCog6Tooth className="w-4 h-4" /> تنظیمات
                </button>}
                <button onClick={handleLogout} disabled={loggingOut} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50">
                  <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> {loggingOut ? 'در حال خروج...' : 'خروج'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
