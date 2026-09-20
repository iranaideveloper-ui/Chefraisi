import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Consultation from "@/models/Consultation";
import Launch from "@/models/Launch";
import { getAdminUser, getSuperAdminUser } from "@/lib/sessionUser";

const projectFields = ["restaurantName", "location", "cuisine", "launchYear", "phone"] as const;
type ProjectField = (typeof projectFields)[number];

function validateProjectBody(body: Record<string, unknown>) {
  const values = Object.fromEntries(projectFields.map((field) => [field, typeof body[field] === "string" ? body[field].trim() : body[field]])) as Record<ProjectField, unknown>;
  if (projectFields.some((field) => !values[field])) return { error: "تکمیل همه فیلدهای پروژه الزامی است" };
  if (typeof values.launchYear !== "number" || !Number.isInteger(values.launchYear) || values.launchYear < 1300 || values.launchYear > 1600) return { error: "سال راه‌اندازی نامعتبر است" };
  return { values };
}

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  await connectDB();
  const projects = await Project.find().sort({ createdAt: -1 }).lean();
  const projectIds = projects.map((project) => project._id);
  const launches = await Launch.find({ sourceProjectId: { $in: projectIds } }).select("sourceProjectId").lean();
  const launchedIds = new Set(launches.map((launch) => String(launch.sourceProjectId)));
  return NextResponse.json({ projects: projects.map((project) => ({ ...project, isPublished: launchedIds.has(String(project._id)) })) });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "بدنه درخواست نامعتبر است" }, { status: 400 });
  if (!body.sourceConsultationId && admin.role !== "super_admin") return NextResponse.json({ error: "فقط مدیر ارشد امکان ایجاد پروژه را دارد" }, { status: 403 });
  const validation = validateProjectBody(body);
  if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });
  if (!validation.values) return NextResponse.json({ error: "اطلاعات پروژه نامعتبر است" }, { status: 400 });
  const sourceConsultationId = body.sourceConsultationId;
  if (sourceConsultationId && (!mongoose.isValidObjectId(sourceConsultationId) || typeof sourceConsultationId !== "string")) return NextResponse.json({ error: "درخواست مشاوره نامعتبر است" }, { status: 400 });

  await connectDB();
  if (sourceConsultationId) {
    await Project.updateMany({ sourceConsultationId: null }, { $unset: { sourceConsultationId: 1 } });
    const consultation = await Consultation.findOne({ _id: sourceConsultationId, status: "referred", projectId: null }).select("_id").lean();
    if (!consultation) return NextResponse.json({ error: "درخواست ارجاع‌شده یافت نشد" }, { status: 404 });
    const existing = await Project.exists({ sourceConsultationId });
    if (existing) return NextResponse.json({ error: "برای این درخواست قبلاً پروژه ثبت شده است" }, { status: 409 });
  }

  try {
    const optionalCardData = {
      ...(typeof body.image === "string" && body.image.trim() ? { image: body.image.trim() } : {}),
      ...(Array.isArray(body.servicesProvided) ? { servicesProvided: body.servicesProvided.filter((service): service is string => typeof service === "string" && Boolean(service.trim())).map((service) => service.trim()) } : {}),
    };
    const projectData = sourceConsultationId ? { ...validation.values, ...optionalCardData, sourceConsultationId } : { ...validation.values, ...optionalCardData };
    const project = await Project.create(projectData);
    if (sourceConsultationId) {
      const linkedConsultation = await Consultation.findOneAndUpdate({ _id: sourceConsultationId, status: "referred", projectId: null }, { projectId: project._id }, { new: true }).lean();
      if (!linkedConsultation) {
        await Project.findByIdAndDelete(project._id);
        return NextResponse.json({ error: "درخواست هم‌زمان توسط کاربر دیگری ثبت شد" }, { status: 409 });
      }
    }
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof mongoose.Error && "code" in error && error.code === 11000) return NextResponse.json({ error: "برای این درخواست قبلاً پروژه ثبت شده است" }, { status: 409 });
    return NextResponse.json({ error: "ثبت پروژه انجام نشد" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد امکان حذف پروژه را دارد" }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: "شناسه پروژه نامعتبر است" }, { status: 400 });
  await connectDB();
  const project = await Project.findByIdAndDelete(body.id).lean();
  if (!project) return NextResponse.json({ error: "پروژه یافت نشد" }, { status: 404 });
  if (project.sourceConsultationId) await Consultation.findByIdAndDelete(project.sourceConsultationId);
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  if (!await getAdminUser("create")) return NextResponse.json({ error: "مجوز ایجاد یا ویرایش ندارید" }, { status: 403 });
  const body = await request.json().catch(() => null) as (Record<string, unknown> & { id?: unknown }) | null;
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: "شناسه پروژه نامعتبر است" }, { status: 400 });
  const validation = validateProjectBody(body);
  if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });
  await connectDB();
  const optionalCardData = {
    ...(typeof body.image === "string" && body.image.trim() ? { image: body.image.trim() } : {}),
    ...(Array.isArray(body.servicesProvided) ? { servicesProvided: body.servicesProvided.filter((service): service is string => typeof service === "string" && Boolean(service.trim())).map((service) => service.trim()) } : {}),
  };
  const project = await Project.findByIdAndUpdate(body.id, { ...validation.values, ...optionalCardData }, { new: true, runValidators: true }).lean();
  if (!project) return NextResponse.json({ error: "پروژه یافت نشد" }, { status: 404 });
  await Launch.findOneAndUpdate(
    { sourceProjectId: project._id },
    { $set: { restaurantName: project.restaurantName, location: project.location, cuisine: project.cuisine, launchYear: project.launchYear, image: project.image, servicesProvided: project.servicesProvided || [] } },
  );
  return NextResponse.json({ project });
}
