import { useState } from 'react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderId: string;
  date: string;
  time: string;
  status: string;
  items: OrderItem[];
}

const orders: Order[] = [
  {
    id: 1,
    orderId: '#12345',
    date: '1404/06/01',
    time: '14:30',
    status: 'موفق',
    items: [
      { id: '1', name: 'پیتزا مخصوص', quantity: 2, price: 185000 },
      { id: '2', name: 'سالاد سزار', quantity: 1, price: 65000 }
    ]
  },
  {
    id: 2,
    orderId: '#12344',
    date: '1404/05/20',
    time: '19:45',
    status: 'در انتظار پرداخت',
    items: [
      { id: '3', name: 'برگر ذغالی', quantity: 2, price: 145000 },
      { id: '4', name: 'سالاد سزار', quantity: 1, price: 85000 },
      { id: '5', name: 'سیب زمینی', quantity: 1, price: 45000 }
    ]
  }
];

interface OrdersProps {
  setActiveTab: (tab: string) => void;
}

export default function Orders({ setActiveTab }: OrdersProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const setOrdersList = useState<Order[]>(orders)[1];

  // محاسبه مبلغ کل هر سفارش بر اساس آیتم‌ها
  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  // تغییر تعداد یک آیتم
  const updateItemQuantity = (orderId: number, itemId: string, newQuantity: number) => {
    setOrdersList(currentOrders => 
      currentOrders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map(item => 
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
          };
        }
        return order;
      })
    );
  };

  // تغییر قیمت یک آیتم
  const updateItemPrice = (orderId: number, itemId: string, newPrice: number) => {
    setOrdersList(currentOrders => 
      currentOrders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map(item => 
              item.id === itemId ? { ...item, price: newPrice } : item
            )
          };
        }
        return order;
      })
    );
  };

  const handleRedirectToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab('cart');
  };

  return (
    <div className="bg-black/70 rounded-lg p-4 text-white shadow mb-4">
      <h2 className="font-bold text-lg mb-4 border-b border-gray-700 pb-2">سفارشات</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div 
            key={order.id}
            className="bg-gray-800/50 rounded-lg overflow-hidden"
          >
            <div 
              className="p-4 cursor-pointer hover:bg-gray-800/80 transition-colors"
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="font-medium">سفارش {order.orderId}</div>
                  <div className="text-sm text-gray-400">
                    {order.date} - {order.time}
                  </div>
                </div>
                <div className="text-left flex flex-col items-end">
                  <div className="font-bold text-[#d4af37]">{calculateOrderTotal(order.items).toLocaleString()} تومان</div>
                  <div className={`text-sm ${order.status === 'موفق' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {order.status}
                  </div>
                  {order.status === 'در انتظار پرداخت' && (
                    <button
                      onClick={handleRedirectToCart}
                      className="mt-2 bg-[#d4af37] text-white px-4 py-1 rounded-md text-sm hover:bg-[#b8962e] transition-colors"
                    >
                      تکمیل سفارش در سبد خرید
                    </button>
                  )}
                </div>
              </div>
            </div>

            {expandedId === order.id && (
              <div className="border-t border-gray-700 p-4 bg-gray-800/30">
                <h4 className="text-sm text-gray-400 mb-2">جزئیات سفارش:</h4>
                <ul className="space-y-4">
                  {order.items.map((item) => (
                    <li key={item.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>{(item.price * item.quantity).toLocaleString()} تومان</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-400">تعداد:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(order.id, item.id, parseInt(e.target.value) || 1)}
                            className="w-16 px-1 py-0.5 text-sm bg-gray-700 border border-gray-600 rounded"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-400">قیمت:</label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={item.price}
                            onChange={(e) => updateItemPrice(order.id, item.id, parseInt(e.target.value) || 0)}
                            className="w-24 px-1 py-0.5 text-sm bg-gray-700 border border-gray-600 rounded"
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
