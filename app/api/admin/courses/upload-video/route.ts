import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/sessionUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const maxFileSize = 200 * 1024 * 1024;
const allowedExtensions = new Map([
  [".mp4", new Set(["video/mp4", "application/octet-stream"])],
  [".webm", new Set(["video/webm", "application/octet-stream"])],
  [".mkv", new Set(["video/x-matroska", "video/mkv", "application/octet-stream"])],
  [".mov", new Set(["video/quicktime", "application/octet-stream"])],
]);

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object"
    && value !== null
    && typeof value.name === "string"
    && typeof value.type === "string"
    && typeof value.size === "number"
    && typeof value.arrayBuffer === "function";
}

export async function POST(request: Request) {
  if (!await getAdminUser()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file") ?? null;
  if (!isUploadedFile(file)) return NextResponse.json({ error: "فایلی انتخاب نشده است" }, { status: 400 });

  const extension = path.extname(file.name).toLowerCase();
  const allowedMimeTypes = allowedExtensions.get(extension);
  if (!allowedMimeTypes || (file.type && !allowedMimeTypes.has(file.type))) {
    return NextResponse.json({ error: "فقط فایل‌های MP4، WebM، MKV یا MOV مجاز هستند" }, { status: 400 });
  }
  if (file.size === 0 || file.size > maxFileSize) {
    return NextResponse.json({ error: "حجم فایل ویدیو باید حداکثر ۲۰۰ مگابایت باشد" }, { status: 400 });
  }

  try {
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "videos");
    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ success: true, url: `/uploads/videos/${filename}` }, { status: 201 });
  } catch (error) {
    console.error("Course video upload failed:", error);
    return NextResponse.json({ error: "ذخیره فایل ویدیو انجام نشد" }, { status: 500 });
  }
}