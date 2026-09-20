"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | undefined;

    const checkSession = async (attempt = 0) => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) throw new Error("unauthorized");
        if (!cancelled) setReady(true);
      } catch {
        if (cancelled) return;
        if (attempt < 2) {
          retryTimer = window.setTimeout(() => checkSession(attempt + 1), 500);
        } else {
          setFailed(true);
        }
      }
    };

    checkSession();
    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, []);

  if (failed) {
    return (
      <div className="viewport-min-height bg-gray-950 p-8 text-center text-white">
        <p className="mb-4">برای ورود به پنل کاربر ابتدا وارد حساب خود شوید.</p>
        <button type="button" onClick={() => router.replace("/auth")} className="rounded bg-[#d4af37] px-5 py-2 font-bold text-gray-900">
          ورود به حساب
        </button>
      </div>
    );
  }

  if (!ready) return <div className="viewport-min-height bg-gray-950 p-8 text-center text-gray-400">در حال بررسی حساب کاربری...</div>;

  return <>{children}</>;
}
