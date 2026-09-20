"use client";

import { useEffect, useMemo, useState } from "react";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  isAdmin: boolean;
  role: "user" | "admin" | "super_admin";
  orders?: { id: string; date: string; total: number; items: string[] }[]; // for customers
};

type ApiUser = { _id: string; firstName: string; lastName: string; mobile: string; phone?: string; address?: string; createdAt?: string; role: "user" | "admin" | "super_admin" };

export default function UsersPage() {
  const confirm = useConfirmDialog();
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"admins" | "customers">("admins");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ firstName: "", lastName: "", mobile: "", password: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" }).then((response) => response.json()).then((data) => setIsSuperAdmin(data.user?.role === "super_admin"));
    fetch("/api/admin/users", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data: { users?: ApiUser[] }) => {
        if (data.users) setUsers(data.users.map((user) => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || user.mobile,
          address: user.address,
          createdAt: user.createdAt,
          role: user.role,
          isAdmin: user.role !== "user",
          orders: [],
        })));
        setLoading(false);
      });
  }, []);

  // derived lists
  const admins = useMemo(() => users.filter((u) => u.isAdmin).sort((a, b) => Number(b.role === "super_admin") - Number(a.role === "super_admin")), [users]);
  const customers = useMemo(() => users.filter((u) => !u.isAdmin), [users]);

  const filteredAdmins = useMemo(() => {
    const q = query.trim();
    if (!q) return admins;
    return admins.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.includes(q) || (u.phone && u.phone.includes(q)),
    );
  }, [admins, query]);

  const filteredCustomers = useMemo(() => {
    const q = query.trim();
    if (!q) return customers;
    return customers.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.includes(q) || (u.phone && u.phone.includes(q)),
    );
  }, [customers, query]);

  async function updateRole(id: string, role: "user" | "admin") {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id, role }) });
    const result = await response.json();
    if (!response.ok) { alert(result.error || "تغییر نقش انجام نشد"); return; }
    setUsers((current) => current.map((user) => user.id === id ? { ...user, role, isAdmin: role === "admin" } : user));
  }

  async function createAdmin(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(newAdmin) });
    const result = await response.json(); setSaving(false);
    if (!response.ok) { alert(result.error || "ایجاد ادمین انجام نشد"); return; }
    const user = result.user;
    setUsers((current) => [{ id: user._id, firstName: user.firstName, lastName: user.lastName, phone: user.mobile, role: user.role, isAdmin: true }, ...current]);
    setNewAdmin({ firstName: "", lastName: "", mobile: "", password: "" }); setShowCreateForm(false);
  }

  async function removeUser(id: string) {
    if (!await confirm({ title: "حذف کاربر", description: "این کاربر حذف می‌شود و امکان بازگردانی آن وجود ندارد." })) return;
    const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id }) });
    const result = await response.json();
    if (!response.ok) { alert(result.error || "حذف کاربر انجام نشد"); return; }
    setUsers((current) => current.filter((user) => user.id !== id));
  }

  async function resetPassword(userId: string) {
    if (!await confirm({ title: "ریست رمز عبور", description: "رمز جدید ساخته و از طریق پیامک برای شماره موبایل کاربر ارسال می‌شود.", confirmLabel: "ریست رمز" })) return;
    const response = await fetch("/api/admin/users/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id: userId }) });
    const result = await response.json();
    alert(response.ok ? result.message : result.error || "ریست رمز انجام نشد");
  }

  // Optional: persist to localStorage (commented out for now)
  // useEffect(() => {
  //   localStorage.setItem('admin_users', JSON.stringify(users));
  // }, [users]);

  return (
    <div className="p-6">
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
          <p className="text-sm text-muted-foreground">دو دسته: ادمین‌ها و مشتریان</p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && <button onClick={() => setShowCreateForm((current) => !current)} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white">{showCreateForm ? "بستن فرم" : "ایجاد ادمین"}</button>}
          <input
            placeholder="جستجو بر اساس نام یا شماره"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {showCreateForm && <form onSubmit={createAdmin} className="mb-6 grid gap-3 rounded-lg border border-green-100 bg-green-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input required placeholder="نام" value={newAdmin.firstName} onChange={(event) => setNewAdmin({ ...newAdmin, firstName: event.target.value })} className="rounded border px-3 py-2" />
        <input required placeholder="نام خانوادگی" value={newAdmin.lastName} onChange={(event) => setNewAdmin({ ...newAdmin, lastName: event.target.value })} className="rounded border px-3 py-2" />
        <input required dir="ltr" placeholder="شماره موبایل" value={newAdmin.mobile} onChange={(event) => setNewAdmin({ ...newAdmin, mobile: event.target.value })} className="rounded border px-3 py-2" />
        <input required minLength={6} type="password" dir="ltr" placeholder="رمز عبور اولیه" value={newAdmin.password} onChange={(event) => setNewAdmin({ ...newAdmin, password: event.target.value })} className="rounded border px-3 py-2" />
        <button disabled={saving} className="rounded bg-green-600 px-4 py-2 font-bold text-white disabled:opacity-50 sm:col-span-2 lg:col-span-4">{saving ? "در حال ایجاد..." : "ثبت ادمین جدید"}</button>
      </form>}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 border-b pb-3 mb-3">
          <button
            onClick={() => setActiveTab("admins")}
            className={`px-4 py-2 rounded ${activeTab === "admins" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            ادمین‌ها ({admins.length})
          </button>

          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 rounded ${activeTab === "customers" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            مشتریان ({customers.length})
          </button>
        </div>

        <div>
          {loading ? <div className="py-8 text-center text-gray-500">در حال بارگذاری کاربران...</div> : activeTab === "admins" ? (
            <UserList
              users={filteredAdmins}
              emptyMessage="هیچ ادمینی یافت نشد"
                onDemote={isSuperAdmin ? (id) => updateRole(id, "user") : undefined}
              onDelete={removeUser}
              onResetPassword={isSuperAdmin ? resetPassword : undefined}
              canManage={isSuperAdmin}
            />
          ) : (
              <UserList
              users={filteredCustomers}
              emptyMessage="هیچ مشتری‌ای یافت نشد"
                onPromote={isSuperAdmin ? (id) => updateRole(id, "admin") : undefined}
              onDelete={removeUser}
                onResetPassword={isSuperAdmin ? resetPassword : undefined}
                canManage={isSuperAdmin}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function UserList({
  users,
  emptyMessage,
  onPromote,
  onDemote,
  onDelete,
  onResetPassword,
  canManage,
}: {
  users: User[];
  emptyMessage: string;
  onPromote?: (id: string) => void;
  onDemote?: (id: string) => void;
  onDelete: (id: string) => void;
  onResetPassword?: (userId: string) => void;
  canManage: boolean;
}) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  if (users.length === 0) return <div className="py-8 text-center text-gray-500">{emptyMessage}</div>;

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <div key={u.id} className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:grid-cols-[minmax(220px,1fr)_auto] md:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
              {u.firstName[0]}
            </div>
            <div className="min-w-0">
              <div className="truncate font-bold text-gray-800">{u.firstName} {u.lastName}</div>
              <div className="mt-1 text-sm text-gray-500" dir="ltr">{u.phone ?? "-"}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
            <button onClick={() => setOpenMap((current) => ({ ...current, [u.id]: !current[u.id] }))} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition hover:border-blue-200 hover:bg-blue-50">{openMap[u.id] ? "بستن مشاهده" : "مشاهده"}</button>
            {/* Reset password and actions */}
            <div className="flex flex-wrap items-center gap-2">
              {onResetPassword && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onResetPassword(u.id)}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white transition hover:bg-indigo-700"
                  >
                    ریست پسورد
                  </button>

                </div>
              )}

              {onPromote && (
                <button
                  onClick={() => onPromote(u.id)}
                  className="w-32 rounded-lg bg-green-500 px-3 py-2 text-sm text-white transition hover:bg-green-600"
                >
                  ارتقا به ادمین
                </button>
              )}

              {onDemote && u.role === "admin" && (
                <button
                  onClick={() => onDemote(u.id)}
                  className="w-32 rounded-lg bg-yellow-500 px-3 py-2 text-sm text-white transition hover:bg-yellow-600"
                >
                  کاهش به مشتری
                </button>
              )}

              {canManage && u.role !== "super_admin" && <button onClick={() => onDelete(u.id)} className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white transition hover:bg-red-600">
                حذف
              </button>}
            </div>
          </div>
          {openMap[u.id] && <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs leading-6 text-gray-600 md:col-span-2">نقش: {u.role} | شماره: {u.phone || "-"}<br />آدرس: {u.address || "ثبت نشده"}<br />تاریخ ایجاد: {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fa-IR") : "-"}</div>}
          {/* Collapsible orders for customers */}
          {!u.isAdmin && u.orders && (
            <div className="w-full md:col-span-2">
              <button
                onClick={() => setOpenMap((s) => ({ ...s, [u.id]: !s[u.id] }))}
                className="text-sm text-blue-600"
                aria-expanded={!!openMap[u.id]}
              >
                {openMap[u.id] ? 'پنهان کردن سفارشات' : `نمایش سفارشات (${u.orders.length})`}
              </button>

              <div className={`orders-panel ${openMap[u.id] ? 'height' : ''}`}>
                <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="text-sm text-gray-700 mb-2">سفارشات گذشته:</div>
                  <div className="space-y-2">
                    {u.orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between bg-white p-2 rounded border">
                        <div>
                          <div className="font-medium">سفارش {o.id}</div>
                          <div className="text-xs text-gray-500">تاریخ: {o.date}</div>
                          <div className="text-xs text-gray-500">موارد: {o.items.join(', ')}</div>
                        </div>
                        <div className="font-medium">{o.total.toLocaleString()} تومان</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-right text-sm font-medium">
                    مجموع واریزی: {u.orders.reduce((s, o) => s + o.total, 0).toLocaleString()} تومان
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      ))}
    </div>
  );
}
