"use client";
import { useState, FormEvent } from "react";

interface LoginFormProps {
  onForgotPassword?: () => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    rememberMe: false
  });
  const [error, setError] = useState("");
  const [panelType, setPanelType] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, panelType }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "شماره موبایل یا رمز عبور اشتباه است");
        return;
      }
      if (panelType === "admin" && result.user.role !== "admin" && result.user.role !== "super_admin") {
        setError("شما دسترسی ورود به پنل ادمین را ندارید");
        return;
      }
      const isAdminUser = result.user.role === "admin" || result.user.role === "super_admin";
      window.location.assign(isAdminUser ? "/admin" : "/user-panel");
    } catch (err) {
      console.error("Login error:", err);
      setError("خطا در ورود به سیستم. لطفا دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="block mb-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-[#d4af37]">
          ورود به کافه فراز برتر رامونا
        </h1>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-700/60 p-1" role="group" aria-label="نوع پنل">
          {(["user", "admin"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPanelType(type)}
              className={`rounded-md py-2 text-sm font-bold transition ${panelType === type ? "bg-[#d4af37] text-gray-900" : "text-gray-300 hover:bg-gray-600"}`}
            >
              {type === "user" ? "ورود به پنل کاربر" : "ورود به پنل ادمین"}
            </button>
          ))}
        </div>
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="loginMobile" className="block mb-1.5 text-sm font-medium text-[#d4af37]">شماره موبایل</label>
          <input type="tel" id="loginMobile" name="mobile" value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            required placeholder="مثال: 09123456789"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-[#d4af37] focus:border-[#d4af37] focus:outline-none transition"
            pattern="09[0-9]{9}" />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-[#d4af37]">رمز عبور</label>
          <input type="password" id="password" name="password" value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required placeholder="رمز عبور خود را وارد کنید"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-[#d4af37] focus:border-[#d4af37] focus:outline-none transition" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-gray-300">
            <input type="checkbox" checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="mr-2 w-4 h-4 rounded border-gray-600 text-[#d4af37] focus:ring-[#d4af37]" />
            مرا به خاطر بسپار
          </label>
          <button type="button" onClick={onForgotPassword} className="text-[#d4af37] hover:text-[rgba(212,175,55,0.8)] transition">
            رمز عبور را فراموش کرده‌اید؟
          </button>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[#d4af37] text-gray-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-[rgba(212,175,55,0.8)] disabled:opacity-60 transition text-base ripple">
          {loading ? "در حال ورود..." : panelType === "admin" ? "ورود به پنل ادمین" : "ورود به پنل کاربر"}
        </button>
      </form>
    </div>
  );
}
