"use client";

import { useEffect, useState } from "react";

type PaymentItem = { id?: number; name?: string; price?: number; count?: number };
type Payment = { _id: string; paymentId: string; orderId: string; userMobile: string; amount?: number; items?: PaymentItem[]; createdAt: string };
type GatewayStatus = { isConfigured: boolean; isSandbox: boolean; callbackUrlConfigured: boolean };

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState<number | undefined>();
  const [gateway, setGateway] = useState<GatewayStatus | null>(null);

  useEffect(() => {
    fetch("/api/admin/payments", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { setPayments(data.payments || []); setTotal(data.total); setGateway(data.gateway || null); });
  }, []);

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-gray-800">پرداخت‌ها</h1><p className="mt-1 text-sm text-gray-500">فقط پرداخت‌های موفق نمایش داده می‌شوند.</p></div>
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-bold text-gray-800">وضعیت درگاه زرین‌پال</h2><p className="mt-1 text-sm text-gray-500">اطلاعات محرمانهٔ درگاه در رابط مدیریت نمایش داده نمی‌شود.</p></div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${gateway?.isConfigured ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>
          {gateway ? gateway.isConfigured ? "Merchant ID تنظیم شده" : "نیازمند تنظیم Merchant ID" : "در حال بررسی"}
        </span>
      </div>
      {gateway && <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
        <p>محیط: <strong>{gateway.isSandbox ? "آزمایشی (Sandbox)" : "عملیاتی (Live)"}</strong></p>
        <p>نشانی بازگشت: <strong>{gateway.callbackUrlConfigured ? "دامنهٔ سایت تنظیم شده" : "از دامنهٔ درخواست استفاده می‌شود"}</strong></p>
      </div>}
      <p className="mt-4 text-xs leading-6 text-gray-500">برای راه‌اندازی، <code dir="ltr">ZARINPAL_MERCHANT_ID</code> را فقط در متغیرهای محیطی سرور ثبت کنید. برای تست <code dir="ltr">ZARINPAL_SANDBOX=true</code> و در محیط عملیاتی مقدار آن را خاموش کنید. در انتشار نهایی، <code dir="ltr">NEXT_PUBLIC_SITE_URL</code> را روی دامنهٔ HTTPS سایت بگذارید و سرور را دوباره راه‌اندازی کنید.</p>
    </section>
    <div className="flex flex-wrap gap-4"><div className="rounded-xl bg-white p-5 shadow"><p className="text-sm text-gray-500">تعداد پرداخت موفق</p><strong className="text-2xl text-green-700">{payments.length.toLocaleString("fa-IR")}</strong></div>{total !== undefined && <div className="rounded-xl bg-white p-5 shadow"><p className="text-sm text-gray-500">مبلغ کل</p><strong className="text-2xl text-gray-800">{total.toLocaleString("fa-IR")} تومان</strong></div>}</div>
    <div className="overflow-x-auto rounded-xl bg-white shadow"><table className="w-full min-w-225 text-right text-sm"><thead><tr className="border-b"><th className="p-4">شناسه سفارش</th><th className="p-4">دوره‌های خریداری‌شده</th><th className="p-4">کاربر</th><th className="p-4">شناسه پرداخت (Authority)</th>{total !== undefined && <th className="p-4">مبلغ کل</th>}<th className="p-4">تاریخ و ساعت</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment._id} className="border-b align-top last:border-0"><td className="p-4">{payment.orderId}</td><td className="p-4"><div className="min-w-56 space-y-2">{payment.items?.length ? payment.items.map((item, index) => <div key={`${item.id ?? item.name ?? "course"}-${index}`} className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><p className="font-semibold text-gray-800">{item.name || `دوره ${item.id ?? ""}`}</p><p className="mt-1 text-xs text-gray-600">تعداد: {item.count ?? 1} | مبلغ واحد: {(item.price ?? 0).toLocaleString("fa-IR")} تومان</p><p className="text-xs text-gray-600">جمع این دوره: {((item.price ?? 0) * (item.count ?? 1)).toLocaleString("fa-IR")} تومان</p></div>) : <span className="text-gray-500">جزئیات دوره ثبت نشده است</span>}</div></td><td className="p-4" dir="ltr">{payment.userMobile}</td><td className="p-4" dir="ltr"><span className="break-all">{payment.paymentId}</span></td>{total !== undefined && <td className="whitespace-nowrap p-4 font-semibold">{(payment.amount ?? 0).toLocaleString("fa-IR")} تومان</td>}<td className="whitespace-nowrap p-4">{new Date(payment.createdAt).toLocaleString("fa-IR")}</td></tr>)}</tbody></table></div>
  </div>;
}
