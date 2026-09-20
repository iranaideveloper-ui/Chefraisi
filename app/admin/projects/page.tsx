"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import ImageUpload from "@/components/admin/ImageUpload";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminRole } from "@/components/admin/useAdminRole";

type Project = { _id: string; restaurantName: string; location: string; cuisine: string; launchYear: number; phone: string; image?: string; servicesProvided?: string[]; isPublished?: boolean };
type ReferredConsultation = { _id: string; name: string; family: string; phone: string; consultationType: string; createdAt: string };
type ProjectForm = { restaurantName: string; location: string; cuisine: string; launchYear: string; phone: string; image: string; servicesProvided: string };
const emptyForm: ProjectForm = { restaurantName: "", location: "", cuisine: "", launchYear: "", phone: "", image: "/assets/images/gallery-1.jpg", servicesProvided: "" };

export default function AdminProjects() {
  const confirm = useConfirmDialog();
  const isSuperAdmin = useAdminRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [referredConsultations, setReferredConsultations] = useState<ReferredConsultation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const loadData = async () => {
    const [projectsResponse, consultationsResponse] = await Promise.all([fetch("/api/admin/projects", { credentials: "include", cache: "no-store" }), fetch("/api/admin/consultations?status=referred", { credentials: "include", cache: "no-store" })]);
    const projectResult = await projectsResponse.json();
    const consultationResult = await consultationsResponse.json();
    if (projectsResponse.ok) setProjects(projectResult.projects || []);
    if (consultationsResponse.ok) setReferredConsultations(consultationResult.consultations || []);
  };
  useEffect(() => { loadData(); }, []);

  const submitProject = async (event: FormEvent<HTMLFormElement>, formValues: ProjectForm, sourceConsultationId?: string, onSaved?: () => void) => {
    event.preventDefault();
    setSaving(true); setMessage("");
    const response = await fetch("/api/admin/projects", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ ...formValues, launchYear: Number(formValues.launchYear), servicesProvided: formValues.servicesProvided.split(",").map((service) => service.trim()).filter(Boolean), sourceConsultationId, id: editingId }) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { setMessage(result.error || "ثبت پروژه انجام نشد"); return; }
    setMessage(editingId ? "پروژه با موفقیت ویرایش شد" : "پروژه با موفقیت ثبت شد"); setProjects((current) => editingId ? current.map((project) => project._id === editingId ? result.project : project) : [result.project, ...current]);
    if (editingId) { setEditingId(null); setForm(emptyForm); setShowForm(false); return; }
    if (sourceConsultationId) { setReferredConsultations((current) => current.filter((item) => item._id !== sourceConsultationId)); onSaved?.(); await loadData(); } else { setForm(emptyForm); setShowForm(false); }
  };
  const deleteProject = async (id: string) => {
    if (!await confirm({ title: "حذف پروژه", description: "این پروژه حذف می‌شود و امکان بازگردانی آن وجود ندارد." })) return;
    const response = await fetch("/api/admin/projects", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id }) });
    if (response.ok) setProjects((current) => current.filter((project) => project._id !== id));
  };
  const publishProject = async (id: string) => {
    setPublishingId(id); setMessage("");
    try {
      const response = await fetch("/api/admin/projects/launch", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ projectId: id }) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || "ارسال به راه‌اندازی‌ها انجام نشد"); return; }
      setProjects((current) => current.map((project) => project._id === id ? { ...project, isPublished: true } : project));
      setMessage("پروژه با موفقیت در راه‌اندازی‌ها ثبت و همگام شد");
    } catch { setMessage("ارتباط با سرور برای ارسال پروژه برقرار نشد؛ لطفاً دوباره تلاش کنید"); }
    finally { setPublishingId(null); }
  };
  const editProject = (project: Project) => { setEditingId(project._id); setForm({ restaurantName: project.restaurantName, location: project.location, cuisine: project.cuisine, launchYear: String(project.launchYear), phone: project.phone, image: project.image || emptyForm.image, servicesProvided: (project.servicesProvided || []).join(", ") }); setShowForm(true); setMessage(""); };

  return <div className="space-y-6"><section className="rounded-lg bg-white p-6 shadow"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold text-gray-800">مدیریت پروژه‌ها</h1>{isSuperAdmin && <button onClick={() => { setShowForm((current) => !current); setEditingId(null); setForm(emptyForm); setMessage(""); }} className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">{showForm ? "بستن فرم" : "+ پروژه جدید"}</button>}</div>{showForm && isSuperAdmin && <ProjectFormCard key={editingId || "new"} form={form} onSubmit={submitProject} saving={saving} editing={Boolean(editingId)} />}{message && <p className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}<div className="mt-6 space-y-4">{projects.map((project) => <ProjectCard key={project._id} name={project.restaurantName} location={project.location} cuisine={project.cuisine} launchYear={project.launchYear} phone={project.phone} image={project.image} servicesProvided={project.servicesProvided} isPublished={project.isPublished} publishing={publishingId === project._id} onPublish={isSuperAdmin ? () => publishProject(project._id) : undefined} onEdit={() => editProject(project)} onDelete={isSuperAdmin ? () => deleteProject(project._id) : undefined} />)}</div></section><section className="rounded-lg bg-white p-6 shadow"><h2 className="mb-4 text-xl font-bold text-gray-800">درخواست‌های ارجاع‌شده</h2>{referredConsultations.length === 0 ? <p className="text-sm text-gray-500">درخواست ارجاع‌شده‌ای وجود ندارد.</p> : <div className="space-y-3">{referredConsultations.map((item) => <ReferredCard key={item._id} item={item} onSubmit={submitProject} saving={saving} />)}</div>}</section></div>;
}

function ProjectFormCard({ form: initialForm, onSubmit, saving, editing }: { form: ProjectForm; onSubmit: (event: FormEvent<HTMLFormElement>, form: ProjectForm, sourceConsultationId?: string) => void; saving: boolean; editing?: boolean }) {
  const [form, setForm] = useState(initialForm);
  const update = (field: keyof ProjectForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  return <form onSubmit={(event) => onSubmit(event, form)} className="mt-5 grid gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4 sm:grid-cols-2"><Fields form={form} update={update} /><div className="flex items-end"><button disabled={saving} className="rounded bg-green-600 px-5 py-2 font-bold text-white disabled:opacity-50">{saving ? "در حال ثبت..." : editing ? "ذخیره ویرایش" : "ثبت پروژه"}</button></div></form>;
}

function ReferredCard({ item, onSubmit, saving }: { item: ReferredConsultation; onSubmit: (event: FormEvent<HTMLFormElement>, form: ProjectForm, sourceConsultationId?: string, onSaved?: () => void) => void; saving: boolean }) {
  const [form, setForm] = useState<ProjectForm>({ ...emptyForm, phone: item.phone });
  const [saved, setSaved] = useState(false);
  const update = (field: keyof ProjectForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  if (saved) return null;
  return <article className="rounded-lg border border-gray-200 bg-gray-50 p-4"><div className="mb-3 flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-gray-800">درخواست {item.name} {item.family}</h3><p className="mt-1 text-sm text-gray-600">نوع درخواست: {item.consultationType} | شماره تماس: <span dir="ltr">{item.phone}</span></p></div><span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString("fa-IR")}</span></div><form onSubmit={(event) => onSubmit(event, form, item._id, () => setSaved(true))} className="grid gap-4 sm:grid-cols-2"><Fields form={form} update={update} /><div className="flex items-end"><button disabled={saving} className="rounded bg-green-600 px-5 py-2 font-bold text-white disabled:opacity-50">{saving ? "در حال ثبت..." : "ثبت پروژه"}</button></div></form></article>;
}

function Fields({ form, update }: { form: ProjectForm; update: (field: keyof ProjectForm, value: string) => void }) { return <><Field label="نام رستوران" value={form.restaurantName} onChange={(value) => update("restaurantName", value)} required /><Field label="موقعیت" value={form.location} onChange={(value) => update("location", value)} required /><Field label="نوع غذا" value={form.cuisine} onChange={(value) => update("cuisine", value)} required /><Field label="سال راه‌اندازی" value={form.launchYear} onChange={(value) => update("launchYear", value)} type="number" min="1300" max="1600" required /><Field label="شماره تماس" value={form.phone} onChange={(value) => update("phone", value)} dir="ltr" required /><ImageUpload label="تصویر پروژه" value={form.image} onChange={(value) => update("image", value)} /><Field label="خدمات با ویرگول جدا شود" value={form.servicesProvided} onChange={(value) => update("servicesProvided", value)} required={false} /></>; }
function Field({ label, value, onChange, type = "text", dir, min, max, required }: { label: string; value: string; onChange: (value: string) => void; type?: string; dir?: "ltr"; min?: string; max?: string; required?: boolean }) { return <label className="text-sm font-semibold text-gray-700">{label}<input value={value} onChange={(event) => onChange(event.target.value)} type={type} dir={dir} min={min} max={max} required={required} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>; }
function ProjectCard({ name, location, cuisine, launchYear, phone = "", image = "", servicesProvided = [], isPublished, publishing, onPublish, onEdit, onDelete }: { name: string; location: string; cuisine: string; launchYear: number; phone?: string; image?: string; servicesProvided?: string[]; isPublished?: boolean; publishing?: boolean; onPublish?: () => void; onEdit?: () => void; onDelete?: () => void }) { return <div className="rounded-lg border border-gray-200 bg-gray-50 p-4"><div className="mb-2 flex items-start justify-between"><div className="flex items-center gap-3">{image && <Image src={image} alt={name} width={64} height={64} className="h-16 w-16 rounded object-cover" />}<h3 className="text-lg font-semibold text-gray-800">{name}</h3></div><span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">فعال</span></div><p className="text-sm text-gray-600">موقعیت: {location}</p><p className="text-sm text-gray-600">نوع غذا: {cuisine}</p><p className="text-sm text-gray-600">سال راه‌اندازی: {launchYear}</p>{phone && <p className="text-sm text-gray-600">شماره تماس: <span dir="ltr">{phone}</span></p>}<div className="mt-2 flex flex-wrap gap-1">{servicesProvided.map((service) => <span key={service} className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">{service}</span>)}</div>{(onEdit || onDelete || onPublish) && <div className="mt-3 flex flex-wrap gap-3">{onEdit && <button type="button" onClick={onEdit} className="text-blue-600 hover:text-blue-800">ویرایش</button>}{onDelete && <button type="button" onClick={onDelete} className="text-red-600 hover:text-red-800">حذف</button>}{onPublish && <button type="button" onClick={onPublish} disabled={publishing} className="rounded bg-[#d4af37] px-3 py-1 text-sm font-semibold text-gray-900 disabled:opacity-50">{publishing ? "در حال ارسال..." : isPublished ? "به‌روزرسانی راه‌اندازی" : "ارسال به راه‌اندازی‌ها"}</button>}</div>}</div>; }
