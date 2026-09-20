import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Menu from "@/components/Menu";
import Reservation from "@/components/Reservation";
import Location from "@/components/Location";
import Advantages from "@/components/Advantages";
import Chefs from "@/components/Chefs";
import Gallery from "@/components/Gallery";
import { getPublicCourses } from "@/lib/getCourses";
import { getPublicLaunches } from "@/lib/getLaunches";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "راه اندازی رستوران، مشاوره آشپزی، شف رئیسی و فراز برتر رامونا",
  description:
    "راه اندازی رستوران و مشاوره آشپزی با شف رئیسی و فراز برتر رامونا؛ از ایده‌پردازی و طراحی تا آموزش و افتتاح حرفه‌ای رستوران.",
};

export default async function Home() {
  const [courses, launches] = await Promise.all([getPublicCourses(), getPublicLaunches()]);

  return (
    <div className="flex flex-col">
      {/* <!-- هدر با بنر --> */}
      <Header />
      {/* <!-- منوی غذاهای تاپ --> */}
      <Menu courses={courses} />
      {/* <!-- گالری تصاویر --> */}
      <Gallery projects={launches} />
      {/* <!-- سرآشپزها --> */}
      <Chefs />
      {/* <!-- مزیت‌ها --> */}
      <Advantages />
      {/* <!-- تماس با ما --> */}
      <Contact />
      {/* <!-- رزرو میز --> */}
      <Reservation />
      {/* <!-- موقعیت مکانی فراز برتر رامونا روی نقشه --> */}
      <Location  />

    </div>
  );
}
