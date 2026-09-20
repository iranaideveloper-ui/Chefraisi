"use client";

import TeamCarousel from "./TeamCarousel";
import { useEffect, useState } from "react";
import { Department } from "@/data/teamData";

export default function Chefs() {
  const [departments, setDepartments] = useState<Department[]>([]);
  useEffect(() => {
    fetch("/api/team", { cache: "no-store" }).then((response) => response.json()).then((result) => { if (result.members) setDepartments(result.members); });
  }, []);
  return (
    <section id="chefs" className="py-10 sm:py-16 bg-gray-900 px-2 sm:px-0 fade-in">
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#d4af37] text-center mb-6 sm:mb-10"
      >
        دپارتمان‌های تخصصی
      </h2>
      <div className="max-w-6xl mx-auto">
        <TeamCarousel items={departments} />
      </div>
    </section>
  )
}