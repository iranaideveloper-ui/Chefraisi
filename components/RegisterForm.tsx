"use client";

import { FormEvent, useState } from "react";


export default function RegisterForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "خطا در ثبت‌نام");
      setMessage(result.message);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت‌نام");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      
      <div className="w-full">
      <div className="block mb-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-[#d4af37]">
          ثبت نام در کافه فراز برتر رامونا
        </h1>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">{error}</div>}
        {message && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 text-sm">{message}</div>}
        <div>
          <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-[#d4af37]">رمز عبور</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={6}
            placeholder="حداقل ۶ کاراکتر"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-[#d4af37] focus:border-[#d4af37] focus:outline-none transition"
          />
        </div>

        <div>
          <label
            htmlFor="mobile"
            className="block mb-1.5 text-sm font-medium text-[#d4af37]"
          >
            شماره موبایل
          </label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            required
            placeholder="مثال: 09123456789"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-[#d4af37] focus:border-[#d4af37] focus:outline-none transition"
            pattern="09[0-9]{9}"
            title="شماره موبایل باید با 09 شروع شود و 11 رقم باشد."
          />
        </div>

        <div>
          <label
            htmlFor="firstName"
            className="block mb-1.5 text-sm font-medium text-[#d4af37]"
          >
            نام
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            placeholder="نام خود را وارد کنید"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-[#d4af37] focus:border-[#d4af37] focus:outline-none transition"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block mb-1.5 text-sm font-medium text-[#d4af37]"
          >
            نام خانوادگی
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            placeholder="نام خانوادگی خود را وارد کنید"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-[#d4af37] focus:border-[#d4af37] focus:outline-none transition"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block mb-1.5 text-sm font-medium text-[#d4af37]"
          >
            آدرس
          </label>
          <textarea
            id="address"
            name="address"
            required
            placeholder="آدرس دقیق خود را برای ارسال سفارش وارد کنید"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-[#d4af37] focus:border-[#d4af37] focus:outline-none transition"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-[#d4af37] text-gray-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-[rgba(212,175,55,0.8)] transition text-base ripple"
        >
          {loading ? "در حال ثبت‌نام..." : "ثبت نام"}
        </button>
      </form>
      
      <p className="text-xs text-gray-400 mt-6 text-center">
        {`با کلیک بر روی "ثبت نام"، با`}
        {" "}
        <button type="button" className="text-yellow-500 hover:underline mr-1">
          شرایط خدمات
        </button>
        {" "}
        موافقت می‌کنید.
      </p>
    </div>
    </>
  );
}
