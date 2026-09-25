'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import { 
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineRectangleGroup,
  HiOutlineClipboardDocumentList,
  HiOutlineBanknotes,
  HiOutlineUsers,
  HiOutlineChatBubbleLeft,
  HiOutlineXMark,
} from 'react-icons/hi2';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: Array<
  | { href: string; icon: typeof HiOutlineHome; label: string }
  | { type: 'divider' }
> = [
  { href: '/admin', icon: HiOutlineHome, label: 'داشبورد' },
  { href: '/admin/consultations', icon: HiOutlineClipboardDocumentList, label: 'درخواست‌های مشاوره' },
  { href: '/admin/courses', icon: HiOutlineRectangleGroup, label: 'ثبت‌نام در دوره‌ها' },
  { href: '/admin/users', icon: HiOutlineUsers, label: 'مدیریت کاربران' },
  { href: '/admin/projects', icon: HiOutlineShoppingBag, label: 'مدیریت پروژه‌ها' },
  { href: '/admin/team', icon: HiOutlineUsers, label: 'مدیریت دپارتمان‌ها' },
  { href: '/admin/payments', icon: HiOutlineBanknotes, label: 'پرداخت‌ها' },
  { href: '/admin/reports', icon: HiOutlineShoppingBag, label: 'راه‌اندازی‌ها' },
  { type: 'divider' },
  { href: '/admin/content', icon: HiOutlineRectangleGroup, label: 'مدیریت دوره‌ها' },
  { href: '/admin/about', icon: HiOutlineChatBubbleLeft, label: 'درباره ما' },
  { href: '/admin/settings', icon: HiOutlineRectangleGroup, label: 'تنظیمات سایت' },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((data) => {
        if (data.user?.role === 'super_admin') setRole('super_admin');
      })
      .catch(() => undefined);
  }, []);

  const visibleItems = menuItems.filter((item) => {
    if ('type' in item) return true;
    if (role === 'super_admin') return true;
    return ['/admin', '/admin/consultations', '/admin/courses', '/admin/projects', '/admin/payments'].includes(item.href);
  });

  return (
    <>
      {/* Overlay برای موبایل */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed right-0 top-0 flex h-dvh max-h-dvh w-64 flex-col overflow-hidden bg-white border-l border-gray-200 z-50 transform transition-transform duration-300 lg:transform-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ف</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800">فراز برتر رامونا</h1>
              <p className="text-xs text-gray-500">پنل مدیریت</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <HiOutlineXMark className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto p-4 pb-6">
          <ul className="space-y-2">
            {visibleItems.map((item, index) => {
              // برای divider
              if ('type' in item && item.type === 'divider') {
                return <li key={index} className="border-t border-gray-200 my-2" />;
              }

              if (!('href' in item)) {
                return null;
              }

              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#d4af37] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="shrink-0 space-y-3 px-4 pb-4">
          <a
            href="/links"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-[#d4af37] px-3 py-2 text-[#8a6d18] transition-colors hover:bg-[#fff8dc]"
          >
            <QrCode className="h-5 w-5" />
            <span className="font-medium">صفحه لینک‌ها (QR)</span>
          </a>
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg bg-[#d4af37] px-3 py-2 text-white transition-colors hover:bg-[#b8962e]"
          >
            <HiOutlineHome className="h-5 w-5" />
            <span className="font-medium">بازگشت به سایت</span>
          </Link>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">نسخه 1.0.0</p>
            <p className="text-xs text-gray-400">© 2026 فراز برتر رامونا</p>
          </div>
        </div>
      </aside>
    </>
  );
}