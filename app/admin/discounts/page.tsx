"use client";

import { useMemo, useState } from 'react';
import { useConfirmDialog } from '@/components/admin/ConfirmDialog';

interface Discount { id: string; code: string; percent: number; active: boolean; createdAt: string }

export default function DiscountsPage(){
  const confirm = useConfirmDialog();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Discount[]>([
    { id: 'dc1', code: 'WELCOME', percent: 10, active: true, createdAt: new Date().toISOString() }
  ]);

  const filtered = useMemo(()=> items.filter(i=> (i.code).toLowerCase().includes(query.toLowerCase())), [items, query]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">مدیریت تخفیف‌ها</h1>
        <div className="flex gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجو کد..." className="px-3 py-2 rounded bg-gray-900 text-white" />
          <button className="bg-[#d4af37] text-black px-4 py-2 rounded">افزودن تخفیف</button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(it=>(
          <div key={it.id} className="bg-black/70 p-4 rounded text-white flex justify-between">
            <div>
              <div className="font-bold">{it.code} — {it.percent}%</div>
              <div className="text-xs text-gray-400">{it.createdAt}</div>
            </div>
            <div className="flex gap-2">
              <button className={`px-3 py-1 rounded ${it.active? 'bg-green-600 text-white':'bg-gray-600 text-white'}`}>{it.active? 'فعال':'غیرفعال'}</button>
              <button onClick={async () => { if (await confirm({ title: 'حذف تخفیف', description: 'این کد تخفیف حذف می‌شود و امکان بازگردانی آن وجود ندارد.' })) setItems((current) => current.filter((item) => item.id !== it.id)); }} className="bg-red-600 px-3 py-1 rounded">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
