"use client";

import { useMemo, useState } from 'react';
import { useConfirmDialog } from '@/components/admin/ConfirmDialog';

interface FAQ { id: string; q: string; a: string; active: boolean; createdAt: string }

export default function FAQsPage(){
  const confirm = useConfirmDialog();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<FAQ[]>([
    { id: 'f1', q: 'آیا سفارش بازگشتی پذیرفته می‌شود؟', a: 'بله در شرایط خاص', active: true, createdAt: new Date().toISOString() }
  ]);

  const filtered = useMemo(()=> items.filter(i=> (i.q + ' ' + i.a).toLowerCase().includes(query.toLowerCase())), [items, query]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">مدیریت سوالات متداول</h1>
        <div className="flex gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجو سوال..." className="px-3 py-2 rounded bg-gray-900 text-white" />
          <button className="bg-[#d4af37] text-black px-4 py-2 rounded">افزودن سوال</button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(it=>(
          <div key={it.id} className="bg-black/70 p-4 rounded text-white">
            <div className="font-bold">{it.q}</div>
            <div className="text-sm text-gray-300">{it.a}</div>
            <div className="mt-2 flex gap-2">
              <button className={`px-3 py-1 rounded ${it.active? 'bg-green-600 text-white':'bg-gray-600 text-white'}`}>{it.active? 'فعال':'غیرفعال'}</button>
              <button className="bg-yellow-600 text-black px-3 py-1 rounded">ویرایش</button>
              <button onClick={async () => { if (await confirm({ title: 'حذف سوال متداول', description: 'این سوال متداول حذف می‌شود و امکان بازگردانی آن وجود ندارد.' })) setItems((current) => current.filter((item) => item.id !== it.id)); }} className="bg-red-600 text-white px-3 py-1 rounded">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

