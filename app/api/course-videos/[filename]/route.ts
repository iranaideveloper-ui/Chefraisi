import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Order from "@/models/Order";
import { getSessionUser } from "@/lib/sessionUser";
import { getCourseVideoStorageDirectory } from "@/lib/courseVideoStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ filename: string }> };

const contentTypes: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
};

export async function GET(request: Request, { params }: RouteContext) {
  const { filename } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp4|webm|mov|mkv)$/i.test(filename)) {
    return NextResponse.json({ error: "ویدیو یافت نشد" }, { status: 404 });
  }

  await connectDB();
  const videoUrls = [`/api/course-videos/${filename}`, `/uploads/videos/${filename}`];
  const course = await Course.findOne({ "lessons.videoUrl": { $in: videoUrls } })
    .select("legacyId isFree lessons")
    .lean();
  const lesson = course?.lessons.find((item) => videoUrls.includes(item.videoUrl));
  if (!course || !lesson || !Number.isSafeInteger(course.legacyId)) {
    return NextResponse.json({ error: "ویدیو یافت نشد" }, { status: 404 });
  }

  if (!course.isFree && !lesson.isFreePreview) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "برای مشاهده این قسمت وارد حساب شوید" }, { status: 401 });
    const enrollment = await Order.exists({
      userId: user._id,
      status: "paid",
      "items.id": course.legacyId,
    });
    if (!enrollment) return NextResponse.json({ error: "برای مشاهده این قسمت در دوره ثبت‌نام کنید" }, { status: 403 });
  }

  const storagePaths = [
    path.join(getCourseVideoStorageDirectory(), filename),
    path.join(process.cwd(), "public", "uploads", "videos", filename),
  ];
  let filePath = "";
  let fileSize = 0;
  for (const candidate of storagePaths) {
    try {
      const fileStats = await stat(candidate);
      if (fileStats.isFile() && fileStats.size > 0) {
        filePath = candidate;
        fileSize = fileStats.size;
        break;
      }
    } catch {
      // Try the legacy public directory for videos uploaded before protected storage was added.
    }
  }
  if (!filePath) return NextResponse.json({ error: "فایل ویدیو یافت نشد" }, { status: 404 });

  let start = 0;
  let end = fileSize - 1;
  let status = 200;
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "Content-Length": String(fileSize),
    "Content-Type": contentTypes[path.extname(filename).toLowerCase()],
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
  });
  const range = request.headers.get("range");

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) {
      headers.set("Content-Range", `bytes */${fileSize}`);
      return new Response(null, { status: 416, headers });
    }

    if (!match[1]) {
      const suffixLength = Number(match[2]);
      if (!Number.isSafeInteger(suffixLength) || suffixLength < 1) {
        headers.set("Content-Range", `bytes */${fileSize}`);
        return new Response(null, { status: 416, headers });
      }
      start = Math.max(0, fileSize - suffixLength);
    } else {
      start = Number(match[1]);
      end = match[2] ? Number(match[2]) : fileSize - 1;
    }

    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= fileSize || end < start) {
      headers.set("Content-Range", `bytes */${fileSize}`);
      return new Response(null, { status: 416, headers });
    }

    end = Math.min(end, fileSize - 1);
    status = 206;
    headers.set("Content-Length", String(end - start + 1));
    headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
  }

  const stream = createReadStream(filePath, { start, end });
  return new Response(Readable.toWeb(stream) as ReadableStream, { status, headers });
}