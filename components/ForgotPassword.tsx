"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Step = "mobile" | "code" | "password";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function post(path: string, body: Record<string, string>) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw new Error(result.error || "عملیات انجام نشد");
  }

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await post("/api/auth/forgot-password", { mobile });
      setStep("code");
      setCooldown(60);
      setMessage("اگر شماره ثبت شده باشد، کد تایید برای آن ارسال شد.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "ارسال کد انجام نشد");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (cooldown > 0 || loading) return;
    await requestCode({ preventDefault: () => undefined } as FormEvent<HTMLFormElement>);
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await post("/api/auth/forgot-password/verify", { mobile, code });
      setStep("password");
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "کد تایید اشتباه است");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("تکرار رمز عبور با رمز جدید یکسان نیست");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await post("/api/auth/forgot-password/reset", { mobile, code, password });
      router.push("/user-panel");
      router.refresh();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "تغییر رمز انجام نشد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-[#d4af37] sm:text-2xl">بازیابی رمز عبور</h1>
        <p className="mt-2 text-xs text-gray-400">{step === "mobile" ? "شماره موبایل حساب خود را وارد کنید" : step === "code" ? "کد ارسال‌شده را وارد کنید" : "رمز جدید و امن خود را تنظیم کنید"}</p>
      </div>

      {step === "mobile" && (
        <form className="space-y-5" onSubmit={requestCode}>
          <label htmlFor="reset-mobile" className="block text-sm font-medium text-[#d4af37]">شماره موبایل</label>
          <input id="reset-mobile" type="tel" inputMode="numeric" dir="ltr" value={mobile} onChange={(event) => setMobile(event.target.value)} required pattern="09[0-9]{9}" placeholder="09123456789" className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 outline-none transition focus:border-[#d4af37] focus:ring-[#d4af37]" />
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#d4af37] px-6 py-3 text-base font-bold text-gray-900 shadow-lg transition hover:bg-[rgba(212,175,55,0.8)] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "در حال ارسال..." : "ارسال کد تایید"}</button>
        </form>
      )}

      {step === "code" && (
        <form className="space-y-5" onSubmit={verifyCode}>
          <label htmlFor="reset-code" className="block text-sm font-medium text-[#d4af37]">کد تایید</label>
          <input id="reset-code" type="text" inputMode="numeric" dir="ltr" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required pattern="[0-9]{6}" maxLength={6} placeholder="------" className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-center tracking-[0.5em] text-white placeholder-gray-400 outline-none transition focus:border-[#d4af37] focus:ring-[#d4af37]" />
          <button type="submit" disabled={loading || code.length !== 6} className="w-full rounded-lg bg-[#d4af37] px-6 py-3 text-base font-bold text-gray-900 shadow-lg transition hover:bg-[rgba(212,175,55,0.8)] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "در حال بررسی..." : "تایید کد"}</button>
          <button type="button" disabled={loading || cooldown > 0} onClick={resendCode} className="w-full text-sm text-[#d4af37] disabled:text-gray-500">{cooldown > 0 ? `ارسال مجدد پس از ${cooldown} ثانیه` : "ارسال مجدد کد"}</button>
        </form>
      )}

      {step === "password" && (
        <form className="space-y-5" onSubmit={resetPassword}>
          <div><label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-[#d4af37]">رمز عبور جدید</label><input id="new-password" type="password" dir="ltr" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white outline-none transition focus:border-[#d4af37] focus:ring-[#d4af37]" /></div>
          <div><label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-[#d4af37]">تکرار رمز عبور</label><input id="confirm-password" type="password" dir="ltr" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white outline-none transition focus:border-[#d4af37] focus:ring-[#d4af37]" /></div>
          <p className="text-xs text-gray-400">رمز باید حداقل ۸ کاراکتر داشته باشد.</p>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#d4af37] px-6 py-3 text-base font-bold text-gray-900 shadow-lg transition hover:bg-[rgba(212,175,55,0.8)] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "در حال ذخیره..." : "ذخیره رمز جدید و ورود"}</button>
        </form>
      )}

      {message && <p className="mt-5 text-center text-sm text-green-400">{message}</p>}
      {error && <p role="alert" className="mt-5 text-center text-sm text-red-400">{error}</p>}
      <p className="mt-6 text-center text-xs text-gray-400">کد تایید فقط ۱۰ دقیقه اعتبار دارد.</p>
    </div>
  );
}