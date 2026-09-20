"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminRole } from "@/components/admin/useAdminRole";

type Launch = { _id: string; sourceProjectId?: string; restaurantName: string; location: string; cuisine: string; launchYear: number; image: string; servicesProvided: string[]; status: "open" | "renovated" };
type Form = Omit<Launch, "_id" | "sourceProjectId" | "launchYear" | "servicesProvided" | "status"> & { launchYear: string; servicesProvided: string; status: Launch["status"] };
const emptyForm: Form = { restaurantName: "", location: "", cuisine: "", launchYear: "", image: "/assets/images/gallery-1.jpg", servicesProvided: "", status: "open" };

export default function AdminLaunches() {
  const isSuperAdmin = useAdminRole();
  const confirm = useConfirmDialog();
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [referred, setReferred] = useState<Launch[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/launches", { credentials: "include", cache: "no-store" });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || "دریافت راه‌اندازی‌ها انجام نشد"); return; }
    setLaunches(result.launches || []);
    setReferred(result.referredLaunches || []);
  };
  useEffect(() => { void load(); }, []);

  const edit = (launch: Launch) => {
    setEditingId(launch._id);
    setForm({ restaurantName: launch.restaurantName, location: launch.location, cuisine: launch.cuisine, launchYear: String(launch.launchYear), image: launch.image, servicesProvided: launch.servicesProvided.join(", "), status: launch.status });
    setShowForm(true); setMessage("");
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    const payload = { ...form, launchYear: Number(form.launchYear), servicesProvided: form.servicesProvided.split(",").map((item) => item.trim()).filter(Boolean) };
    const response = await fetch("/api/admin/launches", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload) });
    const result = await response.json(); setSaving(false);
    if (!response.ok) { setMessage(result.error || "ذخیره راه‌اندازی انجام نشد"); return; }
    setMessage("راه‌اندازی با موفقیت ذخیره شد"); setForm(emptyForm); setEditingId(null); setShowForm(false); await load();
  };
  const remove = async (id: string) => {
    if (!await confirm({ title: "حذف راه‌اندازی", description: "این راه‌اندازی از سایت حذف می‌شود.", confirmLabel: "حذف" })) return;
    const response = await fetch("/api/admin/launches", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id }) });
    if (response.ok) await load(); else setMessage("حذف راه‌اندازی انجام نشد");
  };
  const update = (field: keyof Form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const cards = (items: Launch[]) => <div className="grid gap-4 lg:grid-cols-2">{items.map((launch) => <article key={launch._id} className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex gap-4"><Image src={launch.image} alt={launch.restaurantName} width={120} height={80} className="h-20 w-28 rounded-lg object-cover" /><div className="min-w-0"><h3 className="font-bold text-gray-800">{launch.restaurantName}</h3><p className="text-sm text-gray-600">{launch.location} | {launch.cuisine}</p><p className="text-sm text-gray-600">سال راه‌اندازی: {launch.launchYear}</p></div></div><div className="mt-3 flex flex-wrap gap-1">{launch.servicesProvided.map((service) => <span key={service} className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">{service}</span>)}</div><div className="mt-4 flex gap-3"><button type="button" onClick={() => edit(launch)} className="text-blue-600 hover:text-blue-800">ویرایش</button>{isSuperAdmin && <button type="button" onClick={() => remove(launch._id)} className="text-red-600 hover:text-red-800">حذف</button>}</div></article>)}</div>;

  return <div className="space-y-6"><section className="rounded-lg bg-white p-6 shadow"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold text-gray-800">مدیریت راه‌اندازی‌ها</h1>{isSuperAdmin && <button type="button" onClick={() => { setShowForm((value) => !value); setEditingId(null); setForm(emptyForm); }} className="rounded bg-blue-600 px-4 py-2 font-bold text-white">{showForm ? "بستن فرم" : "+ راه‌اندازی جدید"}</button>}</div>{message && <p className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}{showForm && <form onSubmit={save} className="mt-5 grid gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4 sm:grid-cols-2"><Field label="نام رستوران" value={form.restaurantName} onChange={(value) => update("restaurantName", value)} /><Field label="موقعیت" value={form.location} onChange={(value) => update("موقعیت", value)} /><Field label="نوع غذا" value={form.cuisine} onChange={(value) => update("cuisine", value)} /><Field label="سال راه‌اندازی" type="number" value={form.launchYear} onChange={(value) => update("launchYear", value)} /><Field label="خدمات با ویرگول" value={form.servicesProvided} onChange={(value) => update("servicesProvided", value)} required={false} /><ImageUpload label="تصویر راه‌اندازی" value={form.image} onChange={(value) => update("image", value)} /><button disabled={saving} className="rounded bg-green-600 px-5 py-2 font-bold text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : editingId ? "ذخیره ویرایش" : "ثبت راه‌اندازی"}</button></form>}{cards(launches)}</section><section className="rounded-lg bg-white p-6 shadow"><h2 className="mb-4 text-xl font-bold text-gray-800">راه‌اندازی‌های ارجاع‌شده</h2>{referred.length ? cards(referred) : <p className="text-sm text-gray-500">هنوز پروژه‌ای از مدیریت پروژه به راه‌اندازی‌ها ارسال نشده است.</p>}</section></div>;
}

function Field({ label, value, onChange, type = "text", required = true }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="text-sm font-semibold text-gray-700">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 font-normal" /></label>; }
