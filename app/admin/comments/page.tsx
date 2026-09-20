"use client";

import { useMemo, useState } from 'react';
import { useConfirmDialog } from '@/components/admin/ConfirmDialog';

interface CommentItem { id: string; author: string; text: string; status: 'visible' | 'hidden'; createdAt: string }

export default function CommentsPage() {
  const confirm = useConfirmDialog();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CommentItem[]>([
    { id: '1', author: 'علی', text: 'عالی بود!', status: 'visible', createdAt: new Date().toISOString() },
  ]);

  const filtered = useMemo(() => items.filter(i => (i.author + ' ' + i.text).toLowerCase().includes(query.toLowerCase())), [items, query]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">مدیریت نظرات</h1>
        <div className="flex gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجو..." className="px-3 py-2 rounded bg-gray-900 text-white" />
          <button className="bg-[#d4af37] text-black px-4 py-2 rounded">افزودن نظر</button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="bg-black/70 p-4 rounded text-white">
            <div className="flex justify-between">
              <div>
                <div className="font-bold">{c.author}</div>
                <div className="text-sm text-gray-300">{c.text}</div>
                <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="bg-yellow-600 text-black px-3 py-1 rounded">ویرایش</button>
                <button onClick={async () => { if (await confirm({ title: 'حذف نظر', description: 'این نظر حذف می‌شود و امکان بازگردانی آن وجود ندارد.' })) setItems((current) => current.filter((item) => item.id !== c.id)); }} className="bg-red-600 text-white px-3 py-1 rounded">حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
