"use client";
import { useEffect, useRef, useState } from "react";
import { RiMenu3Line } from "react-icons/ri";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { FaUserCircle } from "react-icons/fa";

type CurrentUser = {
  firstName?: string;
  lastName?: string;
  mobile: string;
  role: "user" | "admin" | "super_admin";
  avatar?: string;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useCart();
  const router = useRouter();
  const [pulsing, setPulsing] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const prevCountRef = useRef(items.length);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (response.ok) setUser((await response.json()).user);
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (items.length > prevCountRef.current) {
      setPulsing(true);
      const t = setTimeout(() => setPulsing(false), 2000);
      return () => clearTimeout(t);
    }
    prevCountRef.current = items.length;
  }, [items.length]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const panelHref = user?.role === "admin" || user?.role === "super_admin" ? "/admin" : "/user-panel";
  const isAdminUser = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div>
      {/* RESPONSIVE FIX: Keep the fixed header above hero content with mobile-safe blur. */}
      <nav className="fixed top-0 right-0 left-0 flex justify-center sm:p-4 bg-black/30 backdrop-blur-sm [-webkit-backdrop-filter:blur(8px)] z-20 max-h-20 p-2 shadow">
        <div className="max-w-300 w-full relative flex flex-row-reverse justify-between items-center px-4">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
            <Image src="/assets/images/faraz-logo.png" alt="لوگوی فراز برتر رامونا" className="h-16 w-16 rounded-full bg-black/10 object-contain p-1 drop-shadow-lg" width={80} height={80} />
          </div>

          <div className="flex items-center gap-6">
            <Image src="/assets/images/faraz-logo.png" alt="لوگوی فراز برتر رامونا" className="hidden md:block md:w-20 w-[30%] mx-auto drop-shadow-lg" width={128} height={128} />
            {user ? (
              <div className="relative">
                <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="منوی کاربر" aria-expanded={userMenuOpen} className="min-h-11 min-w-11 text-white hover:text-[#d4af37] transition">
                  {user.avatar ? <Image src={user.avatar} alt="تصویر کاربر" width={32} height={32} className="h-8 w-8 rounded-full object-cover" unoptimized /> : <FaUserCircle className="h-7 w-7 sm:h-8 sm:w-8" />}
                </button>
                {userMenuOpen && (
                  <div className="absolute left-0 top-10 z-200 w-52 max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-gray-950 p-3 text-right shadow-xl">
                    <p className="text-xs text-gray-400">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "کاربر وارد شده"}</p>
                    <p className="mt-1 text-sm text-white" dir="ltr">{user.mobile}</p>
                    <Link href={panelHref} onClick={() => setUserMenuOpen(false)} className="mt-3 block rounded px-2 py-2 text-sm text-[#d4af37] hover:bg-white/10">{user.role === "admin" || user.role === "super_admin" ? "ورود به پنل ادمین" : "پنل کاربری من"}</Link>
                    <button type="button" onClick={handleLogout} className="w-full rounded px-2 py-2 text-right text-sm text-red-400 hover:bg-red-500/10">خروج</button>
                  </div>
                )}
              </div>
            ) : <Link href="/auth" className="min-h-11 inline-flex items-center text-white font-extrabold text-sm sm:text-base hover:text-[#d4af37] transition whitespace-nowrap tracking-wide drop-shadow">ورود/ثبت نام</Link>}
            <button className="min-h-11 min-w-11 text-white transition rounded" onClick={() => router.push("/user-panel/cart")} aria-label="سبد خرید">
              <div className="relative">
                <FaShoppingCart className="h-7 w-7 sm:h-8 sm:w-8" />
                {items.length > 0 && <span className={`absolute -top-2 -right-2 flex items-center justify-center text-[10px] sm:text-xs text-white bg-red-600 rounded-full h-5 w-5 ${pulsing ? "animate-pulse ring-2 ring-red-400" : ""}`}>{items.length}</span>}
              </div>
            </button>
          </div>
          <div className="hidden md:flex gap-4 sm:gap-8 font-extrabold text-white text-l tracking-wide drop-shadow">
            <Link href="/" className="hover:text-[#d4af37] transition">خانه</Link>
            <Link href="/about" className="hover:text-[#d4af37] transition">درباره ما</Link>
            <Link href="/#menu" className="hover:text-[#d4af37] transition">آموزش</Link>
            <Link href="/#contact" className="hover:text-[#d4af37] transition">تماس با ما</Link>
            {user && <Link href={panelHref} className="hover:text-[#d4af37] transition">{isAdminUser ? "پنل ادمین" : "پنل کاربر"}</Link>}
          </div>
          <button id="mobile-menu-toggle" className="min-h-11 min-w-11 md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            <RiMenu3Line className="h-7 w-7 sm:h-8 sm:w-8" />
          </button>
        </div>
      </nav>
      <nav id="mobile-menu" className={`fixed inset-x-4 top-14 sm:top-16 z-30 mx-auto max-w-300 md:hidden flex flex-col rounded-lg bg-black/40 backdrop-blur-sm [-webkit-backdrop-filter:blur(8px)] border border-amber-200 shadow-lg text-white overflow-y-auto overscroll-contain transition-all duration-300 ${isOpen ? "max-h-[calc(100dvh-7rem)] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:p-6 opacity-100" : "max-h-0 p-0 opacity-0 pointer-events-none"}`}>
        {[
          { href: "/", label: "خانه" }, { href: "/about", label: "درباره ما" },
          { href: "/#menu", label: "آموزش" }, { href: "/#contact", label: "تماس با ما" },
          ...(user ? [{ href: panelHref, label: isAdminUser ? "پنل ادمین" : "پنل کاربر" }] : []),
          { href: "/auth", label: "ورود/ثبت نام" },
        ].map((item) => <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="min-h-11 flex items-center py-2.5 font-extrabold tracking-wide drop-shadow transition hover:text-[#d4af37]">{item.label}</Link>)}
      </nav>
    </div>
  );
}
