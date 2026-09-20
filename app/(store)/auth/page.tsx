"use client";
import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import ForgotPassword from "@/components/ForgotPassword";
import Image from "next/image";

export default function Auth() {
  const [currentView, setCurrentView] = useState<"login" | "register" | "forgot">("login");

  return (
    <div className="viewport-min-height flex flex-col overflow-x-hidden bg-[#050505]">
      <main className="grow w-full bg-[#050505] px-4 pb-12 pt-24 sm:px-6">
        <div className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-8xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(30rem,36rem)_minmax(0,1fr)] lg:gap-12">
          <section className="order-1 flex min-h-60 items-center justify-center rounded-2xl border border-[#d4af37] bg-[#101010] p-8 sm:p-10 lg:min-h-152">
            <Image
              src="/assets/images/faraz-logo.png"
              alt="لوگوی فراز برتر رامونا"
              width={420}
              height={255}
              priority
              className="h-auto w-full max-w-sm object-contain drop-shadow-[0_12px_24px_rgba(212,175,55,0.18)]"
            />
          </section>

          <section className="order-2 w-full rounded-2xl border border-[#d4af37] bg-gray-800/60 p-4 shadow-2xl backdrop-blur-md sm:p-8">
        <div className="mb-6 flex justify-center gap-4">
          <button onClick={() => setCurrentView("register")} className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 ${currentView === "register" ? "bg-[#d4af37] text-gray-900" : "bg-gray-700 text-gray-300"}`}>ثبت نام</button>
          <button onClick={() => setCurrentView("login")} className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 ${currentView === "login" ? "bg-[#d4af37] text-gray-900" : "bg-gray-700 text-gray-300"}`}>ورود</button>
        </div>
        <div className="relative w-full">
          {currentView === "register" && <RegisterForm />}
          {currentView === "login" && <LoginForm onForgotPassword={() => setCurrentView("forgot")} />}
          {currentView === "forgot" && (
            <div className="w-full">
              <div className="mb-4"><button onClick={() => setCurrentView("login")} className="text-[#d4af37] hover:text-[rgba(212,175,55,0.8)] transition text-sm">← بازگشت به صفحه ورود</button></div>
              <ForgotPassword />
            </div>
          )}
        </div>
          </section>

          <section className="relative order-3 min-h-72 overflow-hidden rounded-2xl border border-[#d4af37] sm:min-h-96 lg:min-h-152">
            <Image
              src="/assets/images/bg-header.png"
              alt="فضای رستوران"
              fill
              sizes="(max-width: 1023px) 100vw, 33vw"
              className="object-cover object-[28%_center]"
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#050505]/35" />
          </section>
        </div>
      </main>
    </div>
  );
}
