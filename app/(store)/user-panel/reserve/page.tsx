"use client";

import { useEffect, useState } from 'react';

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

export default function Page() {
	const [items, setItems] = useState<ReservationItem[]>([]);

	useEffect(() => {
		try {
			const key = 'fermo_reservations';
			const raw = localStorage.getItem(key);
			const parsed = raw ? JSON.parse(raw) : [];
			const stored = parsed as unknown;
			// normalize items to ensure deposit fields exist
			const norm = Array.isArray(stored)
				? stored.map((i: unknown) => {
					const src = i as Partial<ReservationItem>;
					return {
						...(src as ReservationItem),
						depositAmount: src.depositAmount != null ? Number(src.depositAmount) : 0,
						depositPaid: !!src.depositPaid,
						depositPaidAt: src.depositPaidAt ?? null,
						depositTx: src.depositTx ?? null,
					};
				})
				: [];
			setItems(norm);
		} catch (err) {
			console.error(err);
			setItems([]);
		}
	}, []);

	const cancelReservation = (id: string) => {
		if (!confirm('آیا از لغو این رزرو مطمئن هستید؟')) return;
		const key = 'fermo_reservations';
		const updated = items.filter(i => i.id !== id);
		localStorage.setItem(key, JSON.stringify(updated));
		setItems(updated);
	};

	const payDeposit = (id: string) => {
		const idx = items.findIndex(i => i.id === id);
		if (idx === -1) return;
		const item = items[idx];
		if (!item.depositAmount || item.depositAmount <= 0) {
			alert('این رزرو بیعانه ندارد.');
			return;
		}
		if (item.depositPaid) {
			alert('بیعانه قبلاً پرداخت شده است.');
			return;
		}
		if (!confirm(`آیا مایل به پرداخت بیعانه به مقدار ${item.depositAmount.toLocaleString()} تومان هستید؟`)) return;

		// simulate payment
		const updated = items.slice();
		updated[idx] = {
			...item,
			depositPaid: true,
			depositPaidAt: new Date().toISOString(),
			depositTx: `TX${Date.now()}`,
		};
		localStorage.setItem('fermo_reservations', JSON.stringify(updated));
		setItems(updated);
		alert('پرداخت بیعانه با موفقیت انجام شد.');
	};

	return (
		<div>
			<h2 className="text-white text-2xl font-bold mb-4">رزروها</h2>
			{items.length === 0 ? (
				<div className="bg-black/70 rounded-lg p-4 text-gray-300">هیچ رزروی یافت نشد.</div>
			) : (
				<div className="space-y-4">
					{items.map(item => (
						<div key={item.id} className="bg-black/70 rounded-lg p-4 text-white">
							<div className="flex justify-between items-start gap-4">
								<div>
									<div className="font-bold">{item.name} {item.family}</div>
									<div className="text-sm text-gray-400">{item.phone} {item.email ? `• ${item.email}` : ''}</div>
									<div className="mt-2 text-sm">تاریخ: <span className="font-bold">{item.date}</span> — ساعت: <span className="font-bold">{item.time}</span></div>
									{item.notes && <div className="mt-2 text-sm text-gray-300">توضیحات: {item.notes}</div>}
									<div className="mt-2 text-sm">
										بیعانه: <span className="font-bold text-[#d4af37]">{(item.depositAmount || 0).toLocaleString()} تومان</span>
										{item.depositPaid ? (
											<span className="text-xs text-green-400 mr-3">(پرداخت شده)</span>
										) : (
											<span className="text-xs text-yellow-300 mr-3">(پرداخت نشده)</span>
										)}
									</div>
								</div>
								<div className="text-left flex flex-col items-end">
									<div className="text-xs text-gray-400 mb-2">ثبت‌شده: {new Date(item.createdAt).toLocaleString()}</div>
									<div className="flex flex-col items-end gap-2">
										<button onClick={() => cancelReservation(item.id)} className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700">لغو رزرو</button>
										{!item.depositPaid && (item.depositAmount && item.depositAmount > 0) && (
											<button onClick={() => payDeposit(item.id)} className="bg-[#d4af37] px-3 py-1 rounded text-sm hover:bg-[#b8962e]">پرداخت</button>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
