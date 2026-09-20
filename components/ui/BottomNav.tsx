"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, House, Info, MessageCircleMore, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { siteConfig } from "../../lib/siteConfig";

type UserRole = "user" | "admin" | "super_admin";

type CurrentUser = {
  firstName?: string;
  lastName?: string;
  mobile: string;
  role: UserRole;
};

type NavKey = "home" | "about" | "reserve" | "profile";

const navItemClass =
  "group relative flex flex-1 flex-col items-center justify-center gap-1.5 rounded-[20px] px-2 py-2.5 transition-all duration-300 ease-out";

function NavIcon({ name, active }: { name: NavKey; active: boolean }) {
  const baseClass = "h-5 w-5 transition-all duration-300";

  switch (name) {
    case "home":
      return <House className={`${baseClass} ${active ? "text-[#d4af37]" : "text-slate-300 group-hover:text-[#d4af37]"}`} />;
    case "about":
      return <Info className={`${baseClass} ${active ? "text-[#d4af37]" : "text-slate-300 group-hover:text-[#d4af37]"}`} />;
    case "reserve":
      return <Check className={`${baseClass} ${active ? "text-[#111827]" : "text-[#111827]"}`} />;
    case "profile":
      return <UserRound className={`${baseClass} ${active ? "text-[#d4af37]" : "text-slate-300 group-hover:text-[#d4af37]"}`} />;
  }
}

export default function BottomNav() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user ?? null);
      })
      .catch(() => setUser(null));
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const panelHref = isAdmin ? "/admin" : "/user-panel";
  const chatHref = siteConfig.baleSupportLink || "https://bale.ai/";

  if (pathname.startsWith("/admin")) return null;

  const active: Record<NavKey, boolean> = {
    home: pathname === "/",
    about: pathname.startsWith("/about"),
    // RESPONSIVE FIX: Keep the reserve shortcut active only on real reserve routes.
    reserve: pathname === "/reserve" || pathname.startsWith("/reserve"),
    profile: pathname.startsWith("/profile") || pathname.startsWith("/user-panel") || pathname.startsWith("/admin") || pathname.startsWith("/auth"),
  };

  const handleReserveClick = () => {
    router.push("/#reservation");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProfileOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* RESPONSIVE FIX: Keep the mobile bar inside Samsung safe-area and viewport bounds. */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[env(safe-area-inset-bottom,0px)] md:hidden">
      <div className="mx-auto w-full max-w-md">
        {/* RESPONSIVE FIX: Put the gesture-bar inset inside the card instead of offsetting it. */}
        <div className="relative overflow-hidden rounded-4xl border border-[#d4af37]/75 bg-[#090b0e]/95 px-3 pb-3 pt-3 shadow-[0_18px_35px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] before:absolute before:inset-0 before:rounded-4xl before:bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_42%)] before:content-['']">
          <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-[#d4af37]/90 to-transparent" />

          <div className="relative flex items-end justify-between gap-2">
            {user ? (
              <div className="relative flex flex-1 items-center justify-center overflow-visible">
                <button
                  type="button"
                  aria-label="حساب کاربری"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className={`${navItemClass} ${active.profile ? "bg-[#121317] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-transparent"}`}
                >
                  <NavIcon name="profile" active={active.profile} />
                  <span className={`text-[11px] font-medium ${active.profile ? "text-[#d4af37]" : "text-slate-300"}`}>
                    من
                  </span>
                </button>

                {profileOpen && (
                  <>
                    {/* RESPONSIVE FIX: Constrain the account menu to narrow phone viewports. */}
                    <div className="fixed bottom-26 left-1/2 right-auto z-200 w-55 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-3xl border border-[#f4e5b8] bg-white/90 p-3 text-right shadow-[0_30px_60px_rgba(15,23,42,0.28)] backdrop-blur-2xl ring-1 ring-white/80 pointer-events-auto">
                    <div className="relative mb-3 flex items-center justify-between rounded-2xl border border-[#f5e7ba] bg-[#fffaf0]/95 px-2 py-2 shadow-[0_8px_18px_rgba(212,175,55,0.12)]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f1d8] text-[#d4af37] ring-1 ring-[#ead39d]">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-bold text-[#8b6a16]">
                        {isAdmin ? "ادمین" : "کاربر"}
                      </span>
                    </div>

                    <div className="relative rounded-[18px] bg-[#fafafa] px-3 py-2 ring-1 ring-slate-100">
                      <p className="text-[11px] text-slate-500">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "کاربر"}</p>
                      <p dir="ltr" className="mt-1 text-sm font-extrabold tracking-tight text-slate-800">
                        {user.mobile}
                      </p>
                    </div>

                    <Link
                      href={panelHref}
                      onClick={() => setProfileOpen(false)}
                      className="relative mt-3 block rounded-2xl bg-linear-to-r from-[#f9f0c8] to-[#f3e3a1] px-2 py-2.5 text-center text-[12px] font-bold text-[#7a5b10] shadow-[0_8px_18px_rgba(212,175,55,0.18)] transition-transform duration-200 hover:scale-[1.01]"
                    >
                      {isAdmin ? "ورود به پنل ادمین" : "پنل کاربری من"}
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="relative mt-2 w-full rounded-2xl border border-red-100 bg-red-50 px-2 py-2 text-center text-[12px] font-bold text-red-600 transition-colors duration-200 hover:bg-red-100"
                    >
                      خروج
                    </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                aria-label="من"
                className={`${navItemClass} ${active.profile ? "bg-[#121317] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-transparent"}`}
              >
                <NavIcon name="profile" active={active.profile} />
                <span className={`text-[11px] font-medium ${active.profile ? "text-[#d4af37]" : "text-slate-300"}`}>
                  من
                </span>
              </Link>
            )}

            <a
              href={chatHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="پشتیبانی"
              className={`${navItemClass} ${active.reserve ? "bg-[#121317] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-transparent"}`}
            >
              <MessageCircleMore className={`h-5 w-5 transition-all duration-300 ${active.reserve ? "text-[#d4af37]" : "text-slate-300 group-hover:text-[#d4af37]"}`} />
              <span className={`text-[11px] font-medium ${active.reserve ? "text-[#d4af37]" : "text-slate-300"}`}>
                پشتیبانی             </span>
            </a>

              <div className="flex items-end justify-center">
              <button
                type="button"
                aria-label="آموزش"
                onClick={handleReserveClick}
                  className={`group relative flex min-h-11 min-w-11 h-18 w-18 touch-manipulation items-center justify-center rounded-full border-4 border-[#0b0b0d] bg-linear-to-br from-[#f3d779] to-[#d4af37] shadow-[0_16px_30px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-[1.02] ${
                  active.reserve ? "shadow-[0_0_0_6px_rgba(212,175,55,0.08),0_18px_30px_rgba(212,175,55,0.42)]" : ""
                }`}
              >
                <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.45),transparent_35%)]" />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#fffaf0]/20 ring-1 ring-[#111827]/10">
                  <NavIcon name="reserve" active={active.reserve} />
                </span>
              </button>
            </div>

            <Link
              href="/about"
              aria-label="درباره ما"
              className={`${navItemClass} ${active.about ? "bg-[#121317] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-transparent"}`}
            >
              <NavIcon name="about" active={active.about} />
              <span className={`text-[11px] font-medium ${active.about ? "text-[#d4af37]" : "text-slate-300"}`}>
                درباره ما
              </span>
            </Link>

            <Link
              href="/"
              aria-label="خانه"
              className={`${navItemClass} ${active.home ? "bg-[#121317] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-transparent"}`}
            >
              <NavIcon name="home" active={active.home} />
              <span className={`text-[11px] font-medium ${active.home ? "text-[#d4af37]" : "text-slate-300"}`}>
                خانه
              </span>
            </Link>
          </div>

        </div>
      </div>
      </nav>
    </>
  );
}
