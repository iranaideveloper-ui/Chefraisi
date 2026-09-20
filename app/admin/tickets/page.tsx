"use client";

import { useMemo, useState } from 'react';

interface Ticket { id: string; subject: string; status: 'open'|'closed'; user: string; createdAt: string }

export default function TicketsPage(){
  const [query, setQuery] = useState('');
  const [items] = useState<Ticket[]>([
    { id: 't1', subject: 'سفارش دیر رسید', status: 'open', user: 'حسین', createdAt: new Date().toISOString() }
  ]);

  const filtered = useMemo(()=> items.filter(i=> (i.subject + ' ' + i.user).toLowerCase().includes(query.toLowerCase())), [items, query]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">مدیریت تیکت‌ها</h1>
        <div className="flex gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجو موضوع یا کاربر" className="px-3 py-2 rounded bg-gray-900 text-white" />
          <button className="bg-[#d4af37] text-black px-4 py-2 rounded">ایجاد تیکت</button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(it=>(
          <div key={it.id} className="bg-black/70 p-4 rounded text-white flex justify-between">
            <div>
              <div className="font-bold">{it.subject}</div>
              <div className="text-sm text-gray-300">کاربر: {it.user}</div>
              <div className="text-xs text-gray-400">{it.createdAt}</div>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 px-3 py-1 rounded">مشاهده</button>
              <button className="bg-red-600 px-3 py-1 rounded">بستن</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
