export interface Department {
  id: number;
  title: string;
  tagline: string;
  services: string[];
  image: string;
}

export const departmentsData: Department[] = [
  {
    id: 1,
    title: "دپارتمان طراحی و دکوراسیون داخلی",
    tagline: "خلق فضاهایی ماندگار برای تجربه‌ای متمایز",
    services: ["طراحی دکوراسیون داخلی", "اجرای تأسیسات", "چیدمان سالن"],
    image: "/images/departments/decor.jpg",
  },
  {
    id: 2,
    title: "دپارتمان تجهیزات و زیرساخت آشپزخانه",
    tagline: "زیرساختی دقیق برای عملکردی بی‌نقص",
    services: ["مشاوره خرید تجهیزات", "نصب و راه‌اندازی", "تأمین و نگهداری مواد"],
    image: "/images/departments/kitchen-equipment.jpg",
  },
  {
    id: 3,
    title: "دپارتمان مهندسی منو و توسعه محصول",
    tagline: "تبدیل ایده‌های ناب به منویی سودآور",
    services: ["طراحی رسپی", "مهندسی منو", "قیمت‌گذاری و سودآوری"],
    image: "/images/departments/menu.jpg",
  },
  {
    id: 4,
    title: "دپارتمان آموزش پرسنل (آشپزخانه و سالن)",
    tagline: "تربیت تیمی حرفه‌ای برای میزبانی درخشان",
    services: ["آموزش منو به آشپزخانه", "آموزش بار سرد و گرم", "آداب تشریفات و سرو"],
    image: "/images/departments/training.jpg",
  },
  {
    id: 5,
    title: "دپارتمان طراحی وبسایت و هوشمندسازی",
    tagline: "ساخت تجربه‌ای هوشمند برای رشد پایدار",
    services: ["طراحی سایت اختصاصی", "سیستم صندوق (POS)", "مدیریت شبکه‌های اجتماعی"],
    image: "/images/departments/tech.jpg",
  },
  {
    id: 6,
    title: "دپارتمان برندینگ و راه‌اندازی (افتتاحیه)",
    tagline: "آغاز قدرتمند یک برند ماندگار",
    services: ["مشاوره انتخاب پلن", "استراتژی تبلیغات", "جشن افتتاحیه"],
    image: "/images/departments/branding.jpg",
  },
];
