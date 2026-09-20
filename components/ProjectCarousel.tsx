"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useEffect, useState } from "react";

import Image from "next/image";
import { Project } from "@/data/projectsData";

interface ProjectCarouselProps {
  items: Project[];
  className?: string;
}

export default function ProjectCarousel({ items, className = "" }: ProjectCarouselProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderProjectCard = (project: Project) => (
    <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full card fade-in">
      <div className="relative aspect-3/2 w-full overflow-hidden bg-gray-900">
        <div className="flex h-full w-full items-center justify-center text-3xl text-[#d4af37]" aria-hidden="true">✦</div>
        <Image
          src={project.image}
          alt={project.restaurantName}
          className="absolute inset-0 h-full w-full object-contain transition-opacity"
          width={400}
          height={256}
          onError={(event) => { event.currentTarget.style.opacity = "0"; }}
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${project.status === "open" ? "bg-green-600" : "bg-blue-600"}`}>
            {project.status === "open" ? "فعال" : "بازسازی‌شده"}
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-5 flex-1 flex flex-col text-right">
        <h3 className="text-lg sm:text-xl font-bold text-[#d4af37] mb-2">{project.restaurantName}</h3>
        <div className="flex justify-between items-center mb-3 text-xs sm:text-sm">
          <span className="text-gray-400">سال راه‌اندازی: {project.launchYear}</span>
          <span className="text-[#d4af37] font-semibold">{project.cuisine}</span>
        </div>
        <p className="text-gray-300 text-xs sm:text-sm mb-3 line-clamp-1">📍 {project.location}</p>
        <div className="mb-3">
          <p className="text-[#d4af37] font-bold text-xs sm:text-sm mb-2">خدمات دریافت شده:</p>
          <div className="flex flex-wrap gap-1">
            {(project.servicesProvided || []).map((service, index) => <span key={index} className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-full">{service}</span>)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isMounted) {
    return <div className={`grid min-h-[32rem] grid-cols-1 gap-6 md:grid-cols-3 ${className}`}>{items.slice(0, 3).map((project, index) => <div key={`${project.id}-${index}`} className="min-w-0">{renderProjectCard(project)}</div>)}</div>;
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={20}
      navigation
      pagination={{ clickable: true }}
      loop
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      }}
      breakpoints={{
        320: { slidesPerView: 1, spaceBetween: 20 },
        768: { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 3, spaceBetween: 40 },
      }}
      className={`projects-swiper ${className}`}
    >
      {items.map((project, index) => <SwiperSlide key={`${project.id}-${index}`} className="mb-10">{renderProjectCard(project)}</SwiperSlide>)}
    </Swiper>
  );
}
