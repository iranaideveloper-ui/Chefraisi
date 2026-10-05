import TeamCarousel from "./TeamCarousel";
import type { Department } from "@/data/teamData";

export default function Chefs({ departments }: { departments: Department[] }) {
  return (
    <section id="chefs" className="py-10 sm:py-16 bg-gray-950 px-2 sm:px-0 fade-in">
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#d4af37] text-center mb-6 sm:mb-10"
      >
        دپارتمان‌های تخصصی
      </h2>
      <div className="max-w-6xl mx-auto relative fade-in">
        <TeamCarousel items={departments} />
      </div>
    </section>
  )
}