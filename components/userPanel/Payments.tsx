"use client";

import { useEffect, useState } from "react";

type Payment = { id: string; orderId: string; userMobile: string; amount: number; status: string; createdAt: string };

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  useEffect(() => {
    fetch("/api/payments", { credentials: "include", cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const result = await response.json();
      setPayments(result.payments || []);
    });
  }, []);
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  return <div className="bg-black/70 rounded-lg p-4 text-white shadow mb-4"><h2 className="font-bold text-lg mb-4 border-b border-gray-700 pb-2">سوابق پرداخت</h2><div className="mb-6 flex justify-between bg-[#d4af37]/10 p-4 rounded-lg"><span className="text-[#d4af37]">جمع پرداخت‌های موفق:</span><span className="text-[#d4af37] font-bold">{total.toLocaleString("fa-IR")} تومان</span></div>{payments.length === 0 ? <p className="text-center py-8 text-gray-400">هنوز پرداختی ثبت نشده است.</p> : <div className="space-y-3">{payments.map((payment) => <div key={payment.id} className="bg-gray-800/50 rounded-lg p-4 flex justify-between items-center"><div><p className="font-medium">سفارش {payment.orderId}</p><p className="text-sm text-gray-400">{new Date(payment.createdAt).toLocaleDateString("fa-IR")}</p></div><div className="text-left"><p className="font-bold text-green-400">{payment.amount.toLocaleString("fa-IR")} تومان</p><p className="text-sm text-green-500">موفق</p></div></div>)}</div>}</div>;
}
