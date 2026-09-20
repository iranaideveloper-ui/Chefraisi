"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { Department } from "@/data/teamData";

interface TeamCarouselProps {
  items: Department[];
  className?: string;
}

export default function TeamCarousel({ items, className = "" }: TeamCarouselProps) {
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
        1024: { slidesPerView: 3, spaceBetween: 32 },
      }}
      className={`team-swiper ${className}`}
    >
      {items.map((department) => (
        <SwiperSlide key={department.id} className="mb-10 h-auto">
          <div className="bg-gray-800 rounded-2xl shadow-lg flex h-125 w-full flex-col items-center overflow-hidden p-5 transition card fade-in hover:scale-105 sm:p-6">
            <div className="relative mb-5 h-44 w-full shrink-0 overflow-hidden rounded-xl border-2 border-[#d4af37] bg-gray-700 p-1 shadow-[0_0_0_1px_rgba(212,175,55,0.25),0_8px_20px_rgba(0,0,0,0.22)] sm:h-52 lg:h-56">
              <Image
                src={department.image}
                alt={department.title}
                className="absolute inset-1 h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)] rounded-lg object-contain bg-gray-900 transition-opacity"
                width={800}
                height={800}
                onError={(event) => { event.currentTarget.style.opacity = "0"; }}
              />
              <div className="flex h-full w-full items-center justify-center rounded-lg text-3xl text-[#d4af37]" aria-hidden="true">✦</div>
            </div>
            <h3 className="flex h-15 w-full min-w-0 shrink-0 items-center justify-center overflow-hidden text-center text-lg font-bold leading-relaxed text-[#d4af37] sm:text-xl">
              {department.title}
            </h3>
            <p className="mb-2 flex h-10 w-full min-w-0 shrink-0 items-start justify-center overflow-hidden text-center text-xs leading-5 text-gray-300 line-clamp-2 sm:text-sm">
              {department.tagline}
            </p>
            <div className="flex h-20 w-full min-w-0 shrink-0 flex-col items-center justify-start gap-1 overflow-hidden">
              {department.services.slice(0, 3).map((service, index) => (
                <span
                  key={index}
                  className="max-w-full truncate rounded-full bg-[#d4af37]/20 px-2 py-1 text-center text-xs text-[#d4af37] leading-4"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
