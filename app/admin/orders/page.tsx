import AdminOrders from '../../../components/admin/AdminOrders';

export default function OrdersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">مدیریت سفارشات</h1>
      <AdminOrders />
    </div>
  );
}
