export interface Course {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  isFree?: boolean;
  category: "cooking" | "design" | "management" | "complete";
}

export const coursesData: Course[] = [
  // دوره های آموزش آشپزی (Cooking Category)
  {
    id: 1,
    image: "/assets/images/product-1.jpg",
    title: "دوره آموزش آشپزی سطح مبتدی",
    description: "آموزش مبانی آشپزی، تکنیک‌های پایه و کار با ابزار آشپزخانه",
    price: 2500000,
    category: "cooking",
  },
  {
    id: 2,
    image: "/assets/images/product-2.jpg",
    title: "دوره آموزش آشپزی پیشرفته",
    description: "تکنیک‌های حرفه‌ای، پخت و پز غذاهای بین‌المللی",
    price: 4000000,
    category: "cooking",
  },
  {
    id: 3,
    image: "/assets/images/product-3.png",
    title: "دوره آموزش تغذیه و تنظیم منو",
    description: "طراحی منو سالم، تغذیه‌شناسی و ایجاد ترکیب‌های موثر",
    price: 2000000,
    category: "cooking",
  },
  {
    id: 4,
    image: "/assets/images/product-4.jpg",
    title: "دوره آموزش مدیریت آشپزخانه",
    description: "مدیریت کارکنان، کنترل هزینه، تنظیم فرآیندها",
    price: 3500000,
    category: "cooking",
  },
  {
    id: 5,
    image: "/assets/images/product-7.jpg",
    title: "دوره آموزش شیرینی‌پزی حرفه‌ای",
    description: "آموزش تهیه شیرینی‌های مختلف و دسرهای حرفه‌ای",
    price: 2800000,
    category: "cooking",
  },
  {
    id: 6,
    image: "/assets/images/product-8.jpg",
    title: "دوره آموزش حفاظت و بهداشت غذایی",
    description: "استانداردهای بهداشتی، سلامت غذایی و ایمنی آشپزخانه",
    price: 0,
    isFree: true,
    category: "cooking",
  },
  // دوره های طراحی، مشاوره و راه‌اندازی
  {
    id: 7,
    image: "/assets/images/product-1.jpg",
    title: "دوره طراحی داخلی رستوران",
    description: "طراحی فضا، انتخاب رنگ‌ها، آراستگی و ایجاد محیطی جذاب",
    price: 3500000,
    category: "design",
  },
  {
    id: 8,
    image: "/assets/images/product-2.jpg",
    title: "دوره مشاوره بازاریابی و فروش",
    description: "استراتژی‌های بازاریابی، جذب مشتری و فروش آنلاین",
    price: 2500000,
    category: "management",
  },
  {
    id: 9,
    image: "/assets/images/product-3.png",
    title: "دوره راه‌اندازی سیستم‌های رستوران",
    description: "سیستم‌های سفارش، حسابداری، مدیریت موجودی",
    price: 4500000,
    category: "management",
  },
  {
    id: 10,
    image: "/assets/images/product-4.jpg",
    title: "دوره آموزش سرویس و آداب رفتار",
    description: "آداب رفتار با مشتری، کار تیمی و ارائه خدمات حرفه‌ای",
    price: 1800000,
    category: "management",
  },
  {
    id: 11,
    image: "/assets/images/product-7.jpg",
    title: "دوره تحلیل بازار و ایده‌پردازی",
    description: "بررسی بازار، تجزیه‌تحلیل رقبا، توسعه مفهوم رستوران",
    price: 2200000,
    category: "design",
  },
  {
    id: 12,
    image: "/assets/images/product-8.jpg",
    title: "دوره مجموعی: راه‌اندازی رستوران صفر تا صد",
    description: "دوره کامل از ایده تا افتتاح و رشد پایدار",
    price: 12000000,
    category: "complete",
  },
];

// تابع برای دریافت دوره‌های یک دسته خاص
export const getCoursesByCategory = (category: Course["category"]) => {
  return coursesData.filter((course) => course.category === category);
};

// تابع برای دریافت تمام دوره‌های آشپزی
export const getCookingCourses = () => getCoursesByCategory("cooking");

// تابع برای دریافت تمام دوره‌های طراحی و مشاوره
export const getDesignAndConsultationCourses = () => [
  ...getCoursesByCategory("design"),
  ...getCoursesByCategory("management"),
];

// تابع برای دریافت اولین 6 دوره
export const getFirstSixCourses = () => coursesData.slice(0, 6);

// تابع برای دریافت آخرین 6 دوره
export const getLastSixCourses = () => coursesData.slice(6, 12);
