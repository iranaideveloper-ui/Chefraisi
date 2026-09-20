import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Launch from "@/models/Launch";
import { getSuperAdminUser } from "@/lib/sessionUser";

export async function POST(request: Request) {
  try {
    if (!await getSuperAdminUser()) return NextResponse.json({ error: "فقط مدیر ارشد امکان ارسال پروژه به راه‌اندازی‌ها را دارد" }, { status: 403 });
    const body = await request.json().catch(() => null) as { projectId?: unknown } | null;
    if (!body || typeof body.projectId !== "string" || !mongoose.isValidObjectId(body.projectId)) return NextResponse.json({ error: "شناسه پروژه نامعتبر است" }, { status: 400 });
    await connectDB();
    const project = await Project.findById(body.projectId).lean();
    if (!project) return NextResponse.json({ error: "پروژه یافت نشد" }, { status: 404 });
    const values = { sourceProjectId: project._id, restaurantName: project.restaurantName, location: project.location, cuisine: project.cuisine, launchYear: project.launchYear, image: project.image || "/assets/images/gallery-1.jpg", servicesProvided: project.servicesProvided || [], status: project.status || "open" };
    let launch = await Launch.findOne({ sourceProjectId: project._id });
    if (launch) {
      launch.set(values);
      await launch.save();
    } else {
      launch = await Launch.create(values);
    }
    return NextResponse.json({ launch });
  } catch (error) {
    if (error instanceof mongoose.Error && "code" in error && error.code === 11000) return NextResponse.json({ error: "این پروژه قبلاً در راه‌اندازی‌ها ثبت شده است" }, { status: 409 });
    console.error("Publish project as launch failed", error);
    return NextResponse.json({ error: "ثبت پروژه در راه‌اندازی‌ها انجام نشد" }, { status: 500 });
  }
}