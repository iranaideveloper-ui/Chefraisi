import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";
import { departmentsData } from "@/data/teamData";

async function ensureSeeded() {
  let members = await TeamMember.find().sort({ legacyId: 1, createdAt: 1 }).lean();
  if (members.length === 0 || !members[0].title) {
    await TeamMember.deleteMany({});
    await TeamMember.insertMany(departmentsData.map((department) => ({ ...department, legacyId: department.id })));
    members = await TeamMember.find().sort({ legacyId: 1, createdAt: 1 }).lean();
  }
  return members;
}

export async function GET() {
  await connectDB();
  const members = await ensureSeeded();
  return NextResponse.json({ members });
}
