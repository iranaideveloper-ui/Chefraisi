import { NextResponse } from "next/server";
import { getAboutContent } from "@/lib/getAboutContent";

export async function GET() {
  const content = await getAboutContent();
  return NextResponse.json({ services: content.consultationServices }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}