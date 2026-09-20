"use client";

import { useMemo, useState } from 'react';

interface Delivery { id: string; orderId: string; address: string; status: 'pending'|'delivered'; createdAt: string }

export default function DeliveriesPage(){
  const [query, setQuery] = useState('');
  const [items] = useState<Delivery[]>([
    { id: 'd1', orderId: '#123', address: 'تهران، فلان خیابان', status: 'pending', createdAt: new Date().toISOString() }
  ]);

  const filtered = useMemo(()=> items.filter(i=> (i.orderId + ' ' + i.address).toLowerCase().includes(query.toLowerCase())), [items, query]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">مدیریت تحویل‌ها</h1>
        <div className="flex gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجو سفارش یا آدرس" className="px-3 py-2 rounded bg-gray-900 text-white" />
          <button className="bg-[#d4af37] text-black px-4 py-2 rounded">افزودن تحویل</button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(it=>(
          <div key={it.id} className="bg-black/70 p-4 rounded text-white flex justify-between">
            <div>
              <div className="font-bold">سفارش {it.orderId}</div>
              <div className="text-sm text-gray-300">{it.address}</div>
              <div className="text-xs text-gray-400">{it.createdAt}</div>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 px-3 py-1 rounded">جزئیات</button>
              <button className="bg-green-600 px-3 py-1 rounded">علامت تحویل شد</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
