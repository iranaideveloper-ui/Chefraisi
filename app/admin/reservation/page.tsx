"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useConfirmDialog } from '@/components/admin/ConfirmDialog';

interface ReservationItem {
  id: string;
  name: string;
  family: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  notes?: string;
  depositAmount?: number;
  depositPaid?: boolean;
  depositPaidAt?: string | null;
  depositTx?: string | null;
  createdAt: string;
}

export default function AdminReservationsPage() {
  const confirm = useConfirmDialog();
  const [items, setItems] = useState<ReservationItem[]>([]);
  const [query, setQuery] = useState('');
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDeposit, setEditDeposit] = useState<string>('0');

  useEffect(() => {
    load();
  }, []);

  function load() {
    try {
      const key = 'fermo_reservations';
      const stored = JSON.parse(localStorage.getItem(key) || '[]') as Partial<ReservationItem>[];
      const norm: ReservationItem[] = stored.map((i) => ({
        id: String(i.id ?? ''),
        name: String(i.name ?? ''),
        family: String(i.family ?? ''),
        phone: String(i.phone ?? ''),
        email: i.email ? String(i.email) : undefined,
        date: String(i.date ?? ''),
        time: String(i.time ?? ''),
        notes: i.notes ? String(i.notes) : undefined,
        depositAmount: i.depositAmount != null ? Number(i.depositAmount) : 0,
        depositPaid: !!i.depositPaid,
        depositPaidAt: i.depositPaidAt ?? null,
        depositTx: i.depositTx ?? null,
        createdAt: String(i.createdAt ?? ''),
      }));
      setItems(norm);
    } catch (err) {
      console.error(err);
      setItems([]);
    }
  }

  function save(updated: ReservationItem[]) {
    localStorage.setItem('fermo_reservations', JSON.stringify(updated));
    setItems(updated);
  }

  function markPaid(id: string) {
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return;
    const updated = items.slice();
    updated[idx] = {
      ...updated[idx],
      depositPaid: true,
      depositPaidAt: new Date().toISOString(),
      depositTx: `ADMIN_TX_${Date.now()}`,
    };
    save(updated);
  }

  function markUnpaid(id: string) {
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return;
    const updated = items.slice();
    updated[idx] = {
      ...updated[idx],
      depositPaid: false,
      depositPaidAt: null,
      depositTx: null,
    };
    save(updated);
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'حذف رزرو', description: 'این رزرو حذف می‌شود و امکان بازگردانی آن وجود ندارد.' })) return;
    const updated = items.filter(i => i.id !== id);
    save(updated);
  }

  function startEdit(id: string) {
    const it = items.find(i => i.id === id);
    if (!it) return;
    setEditingId(id);
    setEditDeposit(String(it.depositAmount || 0));
  }

  function applyEdit() {
    if (!editingId) return;
    const idx = items.findIndex(i => i.id === editingId);
    if (idx === -1) return;
    const updated = items.slice();
    updated[idx] = {
      ...updated[idx],
      depositAmount: Number(editDeposit) || 0,
    };
    save(updated);
    setEditingId(null);
  }

  function exportCSV() {
    const headers: (keyof ReservationItem)[] = ['id', 'name', 'family', 'phone', 'email', 'date', 'time', 'notes', 'depositAmount', 'depositPaid', 'depositPaidAt', 'depositTx', 'createdAt'];
    const rows = items.map(i =>
      headers.map(h => JSON.stringify(i[h] ?? '')).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (filterPaid === 'paid' && !i.depositPaid) return false;
      if (filterPaid === 'unpaid' && i.depositPaid) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.family.toLowerCase().includes(q) ||
        i.phone.toLowerCase().includes(q) ||
        (i.email || '').toLowerCase().includes(q)
      );
    });
  }, [items, query, filterPaid]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">مدیریت رزروها</h1>

      {/* ```tsx */}
      <div className="flex gap-3 mb-4 items-center">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجو نام/تلفن/ایمیل" className="px-3 py-2 rounded shadow border-2" />
        <select value={filterPaid} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterPaid(e.target.value as 'all' | 'paid' | 'unpaid')} className="px-3 py-1 rounded shadow border-2">
          <option value="all">همه</option>
          <option value="paid">پرداخت شده</option>
          <option value="unpaid">پرداخت نشده</option>
        </select>
        <button onClick={load} className="bg-blue-600 text-white px-3 py-2 rounded">بارگذاری</button>
        <button onClick={exportCSV} className="bg-green-600 text-white px-3 py-2 rounded">خروجی CSV</button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-gray-400">رزروی پیدا نشد.</div>}
        {filtered.map(item => (
          <div key={item.id} className="bg-black/70 p-4 rounded text-white">
            <div className="flex justify-between">
              <div>
                <div className="font-bold">{item.name} {item.family}</div>
                <div className="text-sm text-gray-400">{item.phone} {item.email ? `• ${item.email}` : ''}</div>
                <div className="mt-2 text-sm">{item.date} — {item.time}</div>
                {item.notes && <div className="mt-2 text-sm text-gray-300">توضیحات: {item.notes}</div>}
                <div className="mt-2 text-sm">بیعانه: <span className="font-bold text-[#d4af37]">{(item.depositAmount || 0).toLocaleString()} تومان</span> {item.depositPaid ? <span className="text-green-400">(پرداخت شده)</span> : <span className="text-yellow-300">(پرداخت نشده)</span>}</div>
                {item.depositPaid && item.depositTx && <div className="text-xs text-gray-400">TX: {item.depositTx} — {item.depositPaidAt}</div>}
              </div>
              <div className="flex flex-col items-end gap-2">
                {!editingId || editingId !== item.id ? (
                  <>
                    <button onClick={() => startEdit(item.id)} className="bg-yellow-600 text-black px-3 py-1 rounded">ویرایش بیعانه</button>
                    {item.depositPaid ? (
                      <button onClick={() => markUnpaid(item.id)} className="bg-orange-600 text-white px-3 py-1 rounded">برگرداندن پرداخت</button>
                    ) : (
                      <button onClick={() => markPaid(item.id)} className="bg-[#d4af37] text-white px-3 py-1 rounded">علامت پرداخت</button>
                    )}
                    <button onClick={() => remove(item.id)} className="bg-red-600 text-white px-3 py-1 rounded">حذف</button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <input value={editDeposit} onChange={e => setEditDeposit(e.target.value)} className="px-2 py-1 rounded bg-gray-900" />
                    <button onClick={applyEdit} className="bg-green-600 px-3 py-1 rounded">اعمال</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-600 px-3 py-1 rounded">انصراف</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
