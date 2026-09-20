import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import { projectsData } from "@/data/projectsData";

async function ensureSeeded() {
  let projects = await Project.find().sort({ createdAt: -1 }).lean();
  if (projects.length === 0) {
    await Project.insertMany(projectsData.map((project) => ({ restaurantName: project.restaurantName, location: project.location, cuisine: project.cuisine, launchYear: project.launchYear, phone: "00000000000", image: project.image, servicesProvided: project.servicesProvided, status: project.status, legacyId: project.id })));
    projects = await Project.find().sort({ createdAt: -1 }).lean();
  }
  return projects;
}

export async function GET() {
  await connectDB();
  const projects = (await ensureSeeded()).map((project) => ({ ...project, servicesProvided: project.servicesProvided || [], image: project.image || "/assets/images/gallery-1.jpg" }));
  return NextResponse.json({ projects });
}
