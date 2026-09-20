"use client";

import { useEffect, useState } from "react";

type Payment = { _id: string; orderId: string; userMobile: string; amount?: number; createdAt: string };

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState<number | undefined>();

  useEffect(() => {
    fetch("/api/admin/payments", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { setPayments(data.payments || []); setTotal(data.total); });
  }, []);

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-gray-800">پرداخت‌ها</h1><p className="mt-1 text-sm text-gray-500">فقط پرداخت‌های موفق نمایش داده می‌شوند.</p></div>
    <div className="flex flex-wrap gap-4"><div className="rounded-xl bg-white p-5 shadow"><p className="text-sm text-gray-500">تعداد پرداخت موفق</p><strong className="text-2xl text-green-700">{payments.length.toLocaleString("fa-IR")}</strong></div>{total !== undefined && <div className="rounded-xl bg-white p-5 shadow"><p className="text-sm text-gray-500">مبلغ کل</p><strong className="text-2xl text-gray-800">{total.toLocaleString("fa-IR")} تومان</strong></div>}</div>
    <div className="overflow-x-auto rounded-xl bg-white shadow"><table className="w-full text-right text-sm"><thead><tr className="border-b"><th className="p-4">شناسه سفارش</th><th className="p-4">کاربر</th>{total !== undefined && <th className="p-4">مبلغ</th>}<th className="p-4">تاریخ</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment._id} className="border-b last:border-0"><td className="p-4">{payment.orderId}</td><td className="p-4" dir="ltr">{payment.userMobile}</td>{total !== undefined && <td className="p-4">{payment.amount?.toLocaleString("fa-IR")} تومان</td>}<td className="p-4">{new Date(payment.createdAt).toLocaleDateString("fa-IR")}</td></tr>)}</tbody></table></div>
  </div>;
}
