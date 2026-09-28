import type { Course } from "@/data/coursesData";

export type FixedCourse = Course & {
  slug: "free-course" | "restaurant-management" | "master-chef";
  description: string;
  comingSoon?: boolean;
};

export const fixedCourses: FixedCourse[] = [
  {
    id: 90001,
    slug: "free-course",
    image: "/assets/images/product-1.jpg",
    title: "دوره رایگان و مقدماتی",
    description: "آشنایی با مبانی آشپزی حرفه‌ای، مدیریت آشپزخانه و مسیر راه‌اندازی رستوران.",
    price: 0,
    isFree: true,
    category: "cooking",
  },
  {
    id: 90002,
    slug: "restaurant-management",
    image: "/assets/images/product-8.jpg",
    title: "دوره جامع مدیریت و راه‌اندازی رستوران",
    description: "از طراحی مفهوم و منو تا مدیریت عملیات، کنترل هزینه و افتتاح رستوران.",
    price: 12000000,
    category: "complete",
  },
  {
    id: 90003,
    slug: "master-chef",
    image: "/assets/images/special-dishes-5.png",
    title: "دوره تخصصی مستر شف و مهندسی منو",
    description: "آموزش پیشرفته تکنیک‌های آشپزی و طراحی منوی سودآور.",
    price: 0,
    isFree: false,
    category: "complete",
    comingSoon: true,
  },
];