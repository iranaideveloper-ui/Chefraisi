import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/sessionUser";

export const runtime = "nodejs";

const maxFileSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  if (!await getAdminUser()) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "فایل PDF انتخاب نشده است" }, { status: 400 });
  if (file.type !== "application/pdf") return NextResponse.json({ error: "فقط فایل PDF مجاز است" }, { status: 400 });
  if (file.size === 0 || file.size > maxFileSize) return NextResponse.json({ error: "حجم فایل PDF باید کمتر از ۱۰ مگابایت باشد" }, { status: 400 });

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}.pdf`;
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
