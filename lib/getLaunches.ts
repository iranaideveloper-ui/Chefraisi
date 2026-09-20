import connectDB from "@/lib/mongodb";
import Launch from "@/models/Launch";
import { projectsData, type Project } from "@/data/projectsData";

export async function getPublicLaunches(): Promise<Project[]> {
  try {
    await connectDB();
    let launches = await Launch.find().sort({ legacyId: 1, createdAt: 1 }).lean();
    if (launches.length === 0) {
      await Launch.insertMany(projectsData.map((project) => ({ ...project, legacyId: project.id })));
      launches = await Launch.find().sort({ legacyId: 1, createdAt: 1 }).lean();
    }

    return launches.map((launch, index) => ({
      id: launch.legacyId || index + 1,
      image: launch.image || "/assets/images/gallery-1.jpg",
      restaurantName: launch.restaurantName,
      launchYear: launch.launchYear,
      cuisine: launch.cuisine,
      location: launch.location,
      servicesProvided: launch.servicesProvided || [],
      status: launch.status,
    }));
  } catch {
    return projectsData;
  }
}