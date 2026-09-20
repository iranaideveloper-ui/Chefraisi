import ProjectCarousel from "./ProjectCarousel";
import type { Project } from "@/data/projectsData";

export default function Gallery({ projects }: { projects: Project[] }) {
  return (
    <section
      id="gallery"
      className="py-10 sm:py-16 bg-gray-900 px-2 sm:px-0 fade-in"
    >
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#d4af37] text-center mb-6 sm:mb-10"
      >
        راه اندازی ها
      </h2>
      <div className="max-w-6xl mx-auto">
        <ProjectCarousel items={projects} />
      </div>
    </section>
  )
}
