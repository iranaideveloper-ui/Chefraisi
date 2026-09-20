"use client";

import React, { useMemo, useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi2";

type BasketItem = {
  id: string;
  foodName: string;
  qty: number;
  price: number; // per unit
};

type Basket = {
  id: string;
  user: { id: string; name: string; phone?: string };
  items: BasketItem[];
  createdAt: string; // ISO
  paid: boolean;
};

// Mock data - replace with real fetch from server/API
const MOCK_BASKETS: Basket[] = [
  {
    id: "b1",
    user: { id: "u1", name: "علی احمدی", phone: "09121234567" },
    items: [
      { id: "i1", foodName: "پیتزا مخصوص", qty: 1, price: 190000 },
      { id: "i2", foodName: "سالاد فصل", qty: 2, price: 35000 },
    ],
    createdAt: new Date().toISOString(),
    paid: true,
  },
  {
    id: "b2",
    user: { id: "u2", name: "مهدی رضائی", phone: "09121112222" },
    items: [
      { id: "i3", foodName: "برگر ویژه", qty: 1, price: 120000 },
    ],
    createdAt: new Date().toISOString(),
    paid: false,
  },
  {
    id: "b3",
    user: { id: "u1", name: "علی احمدی", phone: "09121234567" },
    items: [
      { id: "i4", foodName: "پاستا قارچ", qty: 1, price: 95000 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    paid: true,
  },
];

// Color schemes for alternating basket items
const BASKET_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-100', accent: 'bg-blue-500' },
  { bg: 'bg-green-50', border: 'border-green-100', accent: 'bg-green-500' },
  { bg: 'bg-purple-50', border: 'border-purple-100', accent: 'bg-purple-500' },
  { bg: 'bg-orange-50', border: 'border-orange-100', accent: 'bg-orange-500' },
  { bg: 'bg-pink-50', border: 'border-pink-100', accent: 'bg-pink-500' },
  { bg: 'bg-indigo-50', border: 'border-indigo-100', accent: 'bg-indigo-500' },
];

function formatDateToFaShort(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatCurrency(num: number) {
  return new Intl.NumberFormat("fa-IR").format(num) + " تومان";
}

function groupBasketsByDay(baskets: Basket[]) {
  const map = new Map<string, Basket[]>();
  baskets.forEach((b) => {
    const day = new Date(b.createdAt).toISOString().slice(0, 10); // YYYY-MM-DD
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(b);
  });
  // sort keys descending (newest first)
  const keys = Array.from(map.keys()).sort((a, b) => (a < b ? 1 : -1));
  return keys.map((k) => ({ day: k, baskets: map.get(k)! }));
}

export default function AdminBasketsPage() {
  // In real app: fetch baskets from API (server-side) and pass as prop or use fetch + SWR
  const [baskets] = useState<Basket[]>(MOCK_BASKETS);

  const grouped = useMemo(() => groupBasketsByDay(baskets), [baskets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">سبدهای خرید کاربران</h2>
        <p className="text-sm text-gray-500">گروه‌بندی شده بر اساس تاریخ</p>
      </div>

      {grouped.length === 0 && (
        <div className="p-6 bg-white rounded-lg border border-gray-200">هیچ سبدی یافت نشد.</div>
      )}

      <div className="space-y-4">
        {grouped.map(({ day, baskets: dayBaskets }) => {
          const dailyTotal = dayBaskets.reduce((sum, b) => {
            const basketTotal = b.items.reduce((s, it) => s + it.price * it.qty, 0);
            return sum + basketTotal;
          }, 0);

          return (
            <section key={day} className="bg-gray-200 rounded-lg border border-gray-200 overflow-hidden">
              <details className="group" open>
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className=" h-10 p-1 rounded-md bg-[#d4af37] flex items-center justify-center text-white font-semibold">
                      {formatDateToFaShort(day)}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDateToFaShort(day)}</p>
                      <p className="text-xs text-gray-500">{dayBaskets.length} سبد</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">جمع روز</p>
                      <p className="text-sm text-gray-700">{formatCurrency(dailyTotal)}</p>
                    </div>
                    <div className="text-gray-400 group-open:hidden">
                      <HiOutlineChevronDown className="w-5 h-5" />
                    </div>
                    <div className="text-gray-400 hidden group-open:block">
                      <HiOutlineChevronUp className="w-5 h-5" />
                    </div>
                  </div>
                </summary>

                <div className="p-4 border-t border-gray-100">
                  <ul className="space-y-3">
                    {dayBaskets.map((b, index) => {
                      const basketTotal = b.items.reduce((s, it) => s + it.price * it.qty, 0);
                      const colorScheme = BASKET_COLORS[index % BASKET_COLORS.length];
                      return (
                        <li key={b.id} className={`${colorScheme.bg} rounded-md border ${colorScheme.border}`}>
                          <details className="group" aria-details={b.id}>
                            <summary className="flex items-center justify-between px-3 py-2 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full ${colorScheme.accent} flex items-center justify-center text-white text-sm font-semibold`}>
                                  {b.user.name.charAt(0)}
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{b.user.name}</p>
                                  <p className="text-xs text-gray-500">{b.user.phone || '-'}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className={`text-sm font-medium ${b.paid ? 'text-green-600' : 'text-red-600'}`}>
                                  {b.paid ? 'پرداخت‌شده' : 'پرداخت‌نشده'}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm">{formatCurrency(basketTotal)}</p>
                                  <p className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleTimeString('fa-IR')}</p>
                                </div>
                              </div>
                            </summary>

                            <div className="p-3 border-t border-gray-100">
                              <table className="w-full text-sm table-fixed">
                                <thead>
                                  <tr className="text-right">
                                    <th className="py-2">نام غذا</th>
                                    <th className="py-2">تعداد</th>
                                    <th className="py-2">قیمت واحد</th>
                                    <th className="py-2">جمع</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {b.items.map((it) => (
                                    <tr key={it.id} className="border-t">
                                      <td className="py-2 pr-2">{it.foodName}</td>
                                      <td className="py-2 text-center">{it.qty}</td>
                                      <td className="py-2 text-right">{formatCurrency(it.price)}</td>
                                      <td className="py-2 text-right">{formatCurrency(it.price * it.qty)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              <div className="mt-3 flex items-center justify-between">
                                <div className="text-xs text-gray-500">شناسه سبد: {b.id}</div>
                                <div className="font-semibold">جمع سبد: {formatCurrency(basketTotal)}</div>
                              </div>
                            </div>
                          </details>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </details>
            </section>
          );
        })}
      </div>
    </div>
  );
}
