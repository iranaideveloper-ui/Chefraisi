import connectDB from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";
import { departmentsData, type Department } from "@/data/teamData";

export async function getPublicDepartments(): Promise<Department[]> {
  try {
    await connectDB();
    let members = await TeamMember.find().sort({ legacyId: 1, createdAt: 1 }).lean();

    if (members.length === 0 || !members[0].title) {
      await TeamMember.deleteMany({});
      await TeamMember.insertMany(departmentsData.map((department) => ({
        ...department,
        legacyId: department.id,
      })));
      members = await TeamMember.find().sort({ legacyId: 1, createdAt: 1 }).lean();
    }

    const usedIds = new Set<number>();
    let nextId = Math.max(0, ...members.map((member) => member.legacyId ?? 0)) + 1;

    return members.map((member) => {
      let id = member.legacyId;
      if (typeof id !== "number" || usedIds.has(id)) {
        while (usedIds.has(nextId)) nextId += 1;
        id = nextId;
        nextId += 1;
      }
      usedIds.add(id);

      return {
        id,
        title: member.title,
        tagline: member.tagline,
        services: member.services,
        image: member.image,
      };
    });
  } catch {
    return departmentsData;
  }
}