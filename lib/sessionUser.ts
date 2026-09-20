import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export type AdminPermission = "view" | "create" | "delete";

export async function getSessionUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    await connectDB();
    return await User.findById(payload.userId).select("firstName lastName mobile role permissions");
  } catch {
    return null;
  }
}

export async function getAdminUser(permission: AdminPermission = "view") {
  void permission;
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) return null;
  return user;
}

export async function getSuperAdminUser() {
  const user = await getSessionUser();
  return user?.role === "super_admin" ? user : null;
}
