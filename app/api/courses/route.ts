import { NextResponse } from "next/server";
import { getPublicCourses } from "@/lib/getCourses";

export const revalidate = 60;

export async function GET() {
  const courses = await getPublicCourses();
  return NextResponse.json({ courses }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}