"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import Link from "next/link";
import CourseLessonsDialog from "@/components/CourseLessonsDialog";
import type { CourseVideoLesson } from "@/components/CourseLessonsDialog";

export interface CardItem {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  discountPercent?: number;
  discountedPrice?: number;
  isFree?: boolean;
  lessons?: CourseVideoLesson[];
  slug?: string;
  comingSoon?: boolean;
}

interface CardCarouselProps {
  items: CardItem[];
  className?: string;
}

export default function CardCarousel({ items, className = "" }: CardCarouselProps) {
  const { addToCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [lessonCourse, setLessonCourse] = useState<CardItem | null>(null);
  const validItems = items.filter((item) => item.title?.trim() && !/^untitled\s*\d*$/i.test(item.title.trim()));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddToCart = (id: number, title: string, price: number, originalPrice: number, isFree?: boolean) => {
    addToCart(id, title, price, { originalPrice, isFree });
  };
  const renderCard = (slide: CardItem, index: number, hasDiscount: boolean, payablePrice: number) => (
    <div className="bg-gray-800 rounded-2xl shadow-lg flex h-full flex-col items-center w-full card fade-in">
      <div className="relative aspect-3/2 w-full overflow-hidden bg-gray-950">
        <div className="flex h-full w-full items-center justify-center text-3xl text-[#d4af37]" aria-hidden="true">✦</div>
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={index < 3}
          onError={(event) => { event.currentTarget.style.opacity = "0"; }}
          className="absolute inset-0 h-full w-full object-contain transition-opacity"
        />
        {hasDiscount && <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-lg">{slide.discountPercent}% تخفیف</span>}
      </div>
      <div className="flex w-full flex-1 flex-col p-4 text-center">
        <h3 className="mb-1 h-14 line-clamp-2 wrap-break-word text-base font-bold text-[#d4af37] sm:text-xl">{slide.title}</h3>
        <p className="mb-2 h-12 line-clamp-2 wrap-break-word text-xs text-gray-300 sm:text-base">{slide.description}</p>
        <div className="mb-3 flex h-9 items-center justify-center">
          {slide.lessons && slide.lessons.length > 0 && (
          <button
            type="button"
            onClick={() => setLessonCourse(slide)}
            className="min-h-9 rounded border border-[#d4af37]/40 px-3 py-1.5 text-xs font-semibold text-[#f5d77d] transition hover:bg-[#d4af37]/10"
          >
            {slide.lessons.length.toLocaleString("fa-IR")} قسمت · مشاهده قسمت‌ها
          </button>
          )}
        </div>
        <div className="mb-3 min-h-12 text-center">
          {slide.comingSoon ? <span className="block text-[#d4af37] font-bold text-base sm:text-lg">به‌زودی</span> : slide.isFree ? <><span className="block text-sm text-gray-400 line-through">{slide.price.toLocaleString("fa-IR")} تومان</span><span className="block text-[#d4af37] font-bold text-base sm:text-lg">رایگان</span></> : hasDiscount ? <><span className="block text-sm text-gray-400 line-through">{slide.price.toLocaleString("fa-IR")} تومان</span><span className="block text-[#d4af37] font-bold text-base sm:text-lg">{payablePrice.toLocaleString("fa-IR")} تومان</span></> : <span className="block text-[#d4af37] font-bold text-base sm:text-lg">{slide.price.toLocaleString("fa-IR")} تومان</span>}
        </div>
        {slide.slug ? (
          slide.comingSoon ? (
            <Link href={`/courses/${slide.slug}`} className="flex h-11 w-full items-center justify-center rounded-lg border border-[#d4af37]/50 px-4 text-center font-bold text-[#f5d77d] transition-colors hover:bg-[#d4af37]/10">
              به‌زودی منتشر می‌شود
            </Link>
          ) : (
            <Link href={`/courses/${slide.slug}`} className="flex h-11 w-full items-center justify-center rounded-lg bg-[#d4af37] px-4 text-center font-bold text-white transition-colors hover:bg-[#b8962e]">
              {slide.isFree ? "مشاهده رایگان دوره" : "ثبت نام و مشاهده دوره"}
            </Link>
          )
        ) : (
          <button onClick={() => handleAddToCart(slide.id, slide.title, slide.isFree ? 0 : payablePrice, slide.price, slide.isFree)} className="flex h-11 w-full items-center justify-center rounded-lg bg-[#d4af37] px-4 text-white transition-colors hover:bg-[#b8962e]">
            افزودن به سبد
          </button>
        )}
      </div>
    </div>
  );

  const cards = validItems.map((slide, index) => {
    const hasDiscount = !slide.isFree && Boolean(slide.discountPercent) && (slide.discountedPrice ?? slide.price) < slide.price;
    const payablePrice = hasDiscount ? slide.discountedPrice || 0 : slide.price;
    return <div key={`${slide.id}-${index}`} className="min-w-0">{renderCard(slide, index, hasDiscount, payablePrice)}</div>;
  });

  if (!isMounted) {
    return <>
      <div className={`grid min-h-128 grid-cols-1 gap-6 md:grid-cols-3 ${className}`}>{cards.slice(0, 3)}</div>
      {lessonCourse && <CourseLessonsDialog key={lessonCourse.id} courseTitle={lessonCourse.title} lessons={lessonCourse.lessons ?? []} access="preview" onClose={() => setLessonCourse(null)} />}
    </>;
  }

  return (
    <>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        navigation
        pagination={{ clickable: true }}
        loop={validItems.length > 3}
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
        className={`menu-swiper ${className}`}
      >
        {validItems.map((slide, index) => {
          const hasDiscount = !slide.isFree && Boolean(slide.discountPercent) && (slide.discountedPrice ?? slide.price) < slide.price;
          const payablePrice = hasDiscount ? slide.discountedPrice || 0 : slide.price;
          return <SwiperSlide key={`${slide.id}-${index}`} className="mb-10">{renderCard(slide, index, hasDiscount, payablePrice)}</SwiperSlide>;
        })}
      </Swiper>
      {lessonCourse && <CourseLessonsDialog key={lessonCourse.id} courseTitle={lessonCourse.title} lessons={lessonCourse.lessons ?? []} access="preview" onClose={() => setLessonCourse(null)} />}
    </>
  );
}
