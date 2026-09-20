'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export default function Cart() {
  const { items, increaseCount, decreaseCount, clearCart } = useCart();
  const [checkingOut, setCheckingOut] = React.useState(false);
  const [message, setMessage] = React.useState('');

  // محاسبه جمع کل
  const total = items.reduce((sum, item) => sum + (item.price * item.count), 0);

  // پرداخت نهایی
  const handleCheckout = async () => {
    if (!items.length || checkingOut) return;
    setCheckingOut(true);
    setMessage('');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items, total }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || 'برای تکمیل خرید ابتدا وارد حساب کاربری شوید.');
        return;
      }
      if (result.free) {
        clearCart();
        setMessage(`ثبت‌نام رایگان با موفقیت انجام شد. شماره سفارش: ${result.order.orderId}`);
        return;
      }
      const paymentResponse = await fetch('/api/payments/zarinpal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId: result.order.orderId }),
      });
      const paymentResult = await paymentResponse.json();
      if (!paymentResponse.ok || !paymentResult.url) {
        setMessage(paymentResult.error || 'اتصال به درگاه پرداخت انجام نشد.');
        return;
      }
      window.location.assign(paymentResult.url);
    } catch {
      setMessage('خطا در تکمیل خرید. لطفاً دوباره تلاش کنید.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="bg-black/70 rounded-lg p-4 text-white shadow mb-4">
      <h2 className="font-bold text-lg mb-4 border-b border-gray-700 pb-2">سبد خرید</h2>
      
      {items.length > 0 ? (
        <>
          <ul className="space-y-4">
            {items.map(item => (
              <li key={item.id} className="flex justify-between items-center bg-gray-800/50 p-3 rounded">
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}{item.isFree && <span className="mr-2 rounded-full bg-[#d4af37]/20 px-2 py-1 text-xs text-[#d4af37]">رایگان</span>}</span>
                  {item.isFree && item.originalPrice ? <span className="text-sm text-gray-400 line-through">{item.originalPrice.toLocaleString()} تومان</span> : <span className="text-sm text-gray-400">{item.price.toLocaleString()} تومان</span>}
                  {item.isFree && <span className="text-sm font-bold text-[#d4af37]">رایگان</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400">{item.price === 0 ? 'رایگان' : `${(item.price * item.count).toLocaleString()} تومان`}</span>
                  <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
                    <button 
                      className="bg-green-600 hover:bg-green-700 w-8 h-8 rounded flex items-center justify-center transition-colors"
                      onClick={() => increaseCount(item.id)}
                    >+</button>
                    <span className="w-8 text-center">{item.count}</span>
                    <button 
                      className="bg-red-600 hover:bg-red-700 w-8 h-8 rounded flex items-center justify-center transition-colors"
                      onClick={() => decreaseCount(item.id)}
                    >-</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center text-lg font-bold mb-4">
              <span>جمع کل:</span>
              <span className="text-green-400">{total.toLocaleString()} تومان</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-[#d4af37] hover:bg-[#b8962e] disabled:opacity-60 text-white py-3 rounded-lg font-bold transition-colors"
            >
              {checkingOut ? 'در حال ثبت سفارش...' : total === 0 ? 'ثبت‌نام رایگان' : 'پرداخت و ثبت نهایی'}
            </button>
            {message && <p className="mt-3 text-center text-sm text-amber-300">{message}</p>}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400">
          سبد خرید شما خالی است
        </div>
      )}
    </div>
  );
}
