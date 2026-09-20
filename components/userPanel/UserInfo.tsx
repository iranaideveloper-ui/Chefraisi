"use client";

import React, { useEffect, useState } from "react";

type UserProfile = { firstName: string; lastName: string; mobile: string; address: string; phone: string; avatar: string };

const emptyProfile: UserProfile = { firstName: "", lastName: "", mobile: "", address: "", phone: "", avatar: "" };

export default function UserInfo() {
  const [form, setForm] = useState<UserProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/profile")
      .then(async (response) => {
        if (!response.ok) throw new Error("احراز هویت انجام نشده است");
        setForm({ ...emptyProfile, ...(await response.json()) });
      })
      .catch(() => setMessage("دریافت اطلاعات کاربری انجام نشد"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error();
      setForm({ ...emptyProfile, ...(await response.json()) });
      setMessage("اطلاعات با موفقیت ذخیره شد");
    } catch {
      setMessage("ذخیره اطلاعات انجام نشد");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bg-black/70 rounded-lg p-4 text-white shadow mb-4">در حال دریافت اطلاعات...</div>;

  return (
    <div className="bg-black/70 rounded-lg p-4 text-white shadow mb-4">
      <h2 className="font-bold text-lg mb-2">اطلاعات کاربری</h2>
      <form className="space-y-2" onSubmit={handleSubmit}>
        <input type="text" placeholder="نام" required className="w-full p-2 rounded bg-gray-800 text-white" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
        <input type="text" placeholder="نام خانوادگی" required className="w-full p-2 rounded bg-gray-800 text-white" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
        <input type="tel" placeholder="شماره موبایل" readOnly dir="ltr" className="w-full p-2 rounded bg-gray-800/60 text-white/60" value={form.mobile} />
        <input type="text" placeholder="آدرس" className="w-full p-2 rounded bg-gray-800 text-white" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        <input type="tel" placeholder="شماره تماس" dir="ltr" className="w-full p-2 rounded bg-gray-800 text-white" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <input type="url" placeholder="لینک تصویر پروفایل (اختیاری)" dir="ltr" className="w-full p-2 rounded bg-gray-800 text-white" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} />
        {message && <p className="text-sm text-amber-300">{message}</p>}
        <button type="submit" disabled={saving} className="bg-green-600 disabled:opacity-60 px-4 py-2 rounded text-white font-bold">{saving ? "در حال ذخیره..." : "ذخیره"}</button>
      </form>
    </div>
  );
}
