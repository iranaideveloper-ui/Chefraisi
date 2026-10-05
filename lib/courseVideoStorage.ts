import path from "node:path";

export function getCourseVideoStorageDirectory() {
  return path.resolve(
    process.env.COURSE_VIDEO_STORAGE_DIR?.trim()
      || path.join(process.cwd(), ".private", "course-videos"),
  );
}