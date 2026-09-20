import { NextResponse } from "next/server";
import { getPublicLaunches } from "@/lib/getLaunches";

export const revalidate = 60;

export async function GET() {
  const launches = await getPublicLaunches();
  return NextResponse.json({ launches }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
