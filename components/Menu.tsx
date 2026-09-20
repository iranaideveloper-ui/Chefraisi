import CardCarousel from "./CardCarousel";
import type { PublicCourse } from "@/lib/getCourses";

export default function Menu({ courses }: { courses: PublicCourse[] }) {
  const visibleCourses = courses.filter((course) => {
    const title = course.title?.trim() || "";
    return title.length > 1 && !/^untitled\s*\d*$/i.test(title);
  });

  return (
    <section
      id="menu"
      className="py-10 sm:py-16 bg-gray-950 px-2 sm:px-0 fade-in"
    >
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#d4af37] text-center mb-6 sm:mb-10"
      >
        دوره های آموزش
      </h2>
      <div className="max-w-6xl mx-auto relative fade-in">
        <CardCarousel items={visibleCourses.slice(0, 6)} />
      </div>
    </section>
  );
}