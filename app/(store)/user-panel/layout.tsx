import Link from "next/link";
import { ReactNode } from "react";
import AuthGuard from "@/components/userPanel/AuthGuard";
import { getSiteSettings } from "@/lib/siteSettings";

export default async function UserPanelLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <AuthGuard>
      <div className="viewport-min-height mt-10 overflow-x-hidden bg-linear-to-br from-gray-900 to-black p-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:p-6 md:p-8 md:pb-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <aside className="md:w-1/4">
              <div className="bg-black/70 rounded-lg p-4 text-white shadow">
                <ul className="space-y-2">
                <li><Link href="/user-panel/consultations" className="w-full text-right p-2 rounded block hover:bg-gray-800 text-[#d4af37] font-semibold">درخواست مشاوره‌های من</Link></li>
                <li><Link href="/user-panel/courses" className="w-full text-right p-2 rounded block hover:bg-gray-800">دوره های ثبت‌نام شده</Link></li>
                <li><Link href="/user-panel/payments" className="w-full text-right p-2 rounded block hover:bg-gray-800">پرداخت‌ها</Link></li>
                <li><Link href="/user-panel/userInfo" className="w-full text-right p-2 rounded block hover:bg-gray-800">اطلاعات کاربری</Link></li>
                <li><a href={settings.bale} target="_blank" rel="noopener noreferrer" className="w-full text-right p-2 rounded block text-[#d4af37] hover:bg-gray-800">پشتیبانی</a></li>
                </ul>
              </div>
            </aside>
            <main className="md:w-3/4">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
