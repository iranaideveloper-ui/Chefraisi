import type { Course } from "@/data/coursesData";

export type FixedCourse = Course & {
  slug:
    | "free-course"
    | "restaurant-management"
    | "master-chef"
    | "restaurant-finance"
    | "restaurant-marketing"
    | "restaurant-design";
  description: string;
  comingSoon?: boolean;
};

export const fixedCourses: FixedCourse[] = [
  {
    id: 90001,
    slug: "free-course",
    image: "/assets/images/product-1.jpg",
    title: "پیشگفتار دوره آموزش خصوصی",
    description: "آشنایی با مبانی آشپزی حرفه‌ای، مدیریت آشپزخانه و مسیر راه‌اندازی رستوران.",
    price: 0,
    isFree: true,
    category: "cooking",
  },
  {
    id: 90002,
    slug: "restaurant-management",
    image: "/assets/images/product-8.jpg",
    title: "دوره آموزش خصوصی مستر برگر",
    description: "از طراحی مفهوم و منو تا مدیریت عملیات، کنترل هزینه و افتتاح رستوران.",
    price: 12000000,
    category: "complete",
  },
  {
    id: 90003,
    slug: "master-chef",
    image: "/assets/images/special-dishes-5.png",
    title: "دوره آموزش خصوصی پیتزا آمریکایی و ایتالیایی",
    description: "آموزش پیشرفته تکنیک‌های آشپزی و طراحی منوی سودآور.",
    price: 0,
    isFree: false,
    category: "complete",
    comingSoon: true,
  },
  {
    id: 90004,
    slug: "restaurant-finance",
    image: "/assets/images/product-4.jpg",
    title: "دوره آموزش خصوصی سوخاری",
    description: "بودجه‌بندی، کنترل هزینه مواد اولیه و تحلیل سودآوری برای مدیریت مالی دقیق‌تر رستوران.",
    price: 0,
    category: "management",
    comingSoon: true,
  },
  {
    id: 90005,
    slug: "restaurant-marketing",
    image: "/assets/images/product-2.jpg",
    title: "دوره آموزش خصوصی انواع سس و سالاد",
    description: "طراحی کمپین، جذب مشتری و افزایش فروش حضوری و آنلاین رستوران.",
    price: 0,
    category: "management",
    comingSoon: true,
  },
  {
    id: 90006,
    slug: "restaurant-design",
    image: "/assets/images/product-1.jpg",
    title: "دوره آموزش خصوصی پاستا",
    description: "چیدمان کاربردی، هویت بصری و طراحی تجربه‌ای متمایز برای فضای رستوران.",
    price: 0,
    category: "design",
    comingSoon: true,
  },
];