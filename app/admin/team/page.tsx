"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminRole } from "@/components/admin/useAdminRole";

type Department = { _id: string; title: string; tagline: string; services: string[]; image: string };
type Form = Omit<Department, "_id" | "services"> & { services: string };
const emptyForm: Form = { title: "", tagline: "", services: "", image: "/images/departments/decor.jpg" };

export default function AdminTeam() {
  const isSuperAdmin = useAdminRole();
  const confirm = useConfirmDialog();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadDepartments = async () => {
    const response = await fetch("/api/admin/team", { credentials: "include", cache: "no-store" });
    const result = await response.json();
    if (response.ok) setDepartments(result.members || []);
    else setMessage(result.error || "دریافت دپارتمان‌ها انجام نشد");
  };
  useEffect(() => { loadDepartments(); }, []);

  const saveDepartment = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const services = form.services.split(",").map((service) => service.trim()).filter(Boolean);
    if (services.length > 3) { setSaving(false); setMessage("حداکثر سه خدمت با جداکننده ویرگول مجاز است"); return; }
    const payload = { ...form, services };
    const response = await fetch("/api/admin/team", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { setMessage(result.error || "ذخیره دپارتمان انجام نشد"); return; }
    setDepartments((current) => editingId ? current.map((department) => department._id === editingId ? result.member : department) : [...current, result.member]);
    setMessage(editingId ? "دپارتمان ویرایش شد" : "دپارتمان جدید اضافه شد");
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const editDepartment = (department: Department) => {
    setEditingId(department._id);
    setForm({ title: department.title, tagline: department.tagline, services: department.services.join(", "), image: department.image });
    setShowForm(true);
    setMessage("");
  };

  const deleteDepartment = async (id: string) => {
    if (!await confirm({ title: "حذف دپارتمان", description: "این دپارتمان حذف می‌شود و امکان بازگردانی آن وجود ندارد." })) return;
    const response = await fetch("/api/admin/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || "حذف دپارتمان انجام نشد"); return; }
    setDepartments((current) => current.filter((department) => department._id !== id));
  };

  const update = (field: keyof Form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  return <div className="space-y-6"><section className="rounded-lg bg-white p-6 shadow"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-gray-800">مدیریت دپارتمان‌ها</h1><p className="mt-1 text-sm text-gray-500">این دپارتمان‌ها در بخش خدمات تخصصی سایت نمایش داده می‌شوند.</p></div>{isSuperAdmin && <button onClick={() => { setShowForm((current) => !current); setEditingId(null); setForm(emptyForm); }} className="rounded bg-blue-600 px-4 py-2 font-bold text-white">{showForm ? "بستن فرم" : "+ دپارتمان جدید"}</button>}</div>{showForm && isSuperAdmin && <DepartmentForm form={form} update={update} onSubmit={saveDepartment} saving={saving} editing={Boolean(editingId)} />}{message && <p className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">{departments.map((department) => <article key={department._id} className="rounded-lg border border-gray-200 bg-gray-50 p-4"><div className="flex gap-4"><Image src={department.image} alt={department.title} width={800} height={800} className="h-20 w-20 aspect-square rounded-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /><div><h3 className="text-lg font-semibold text-gray-800">{department.title}</h3><p className="text-sm text-gray-600">{department.tagline}</p></div></div><div className="mt-3 flex flex-wrap gap-2">{department.services.map((service) => <span key={service} className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">{service}</span>)}</div><div className="mt-4 flex gap-3"><button onClick={() => editDepartment(department)} className="text-blue-600 hover:text-blue-800">ویرایش</button>{isSuperAdmin && <button onClick={() => deleteDepartment(department._id)} className="text-red-600 hover:text-red-800">حذف</button>}</div></article>)}</div></section></div>;
}

function DepartmentForm({ form, update, onSubmit, saving, editing }: { form: Form; update: (field: keyof Form, value: string) => void; onSubmit: (event: FormEvent) => void; saving: boolean; editing: boolean }) {
  const field = (label: string, key: keyof Form, required = true) => <label className="text-sm font-semibold text-gray-700">{label}<input required={required} value={form[key]} onChange={(event) => update(key, event.target.value)} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 font-normal" /></label>;
  return <form onSubmit={onSubmit} className="mt-5 grid gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4 sm:grid-cols-2">{field("عنوان دپارتمان", "title")}{field("شعار / مأموریت کوتاه", "tagline")}{field("حداکثر ۳ خدمت با جداکننده ویرگول", "services") }<ImageUpload label="تصویر دپارتمان (پیشنهاد: ۱۲۰۰×۸۰۰)" value={form.image} onChange={(value) => update("image", value)} recommendedDimensions={{ width: 1200, height: 800 }} /><div className="flex items-end"><button disabled={saving} className="rounded bg-green-600 px-5 py-2 font-bold text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : editing ? "ذخیره ویرایش" : "ثبت دپارتمان"}</button></div></form>;
}
