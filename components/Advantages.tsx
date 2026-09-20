import Image from "next/image";

export default function Advantages() {
  return (
    <section className="py-8 sm:py-12 bg-gray-900 px-4 fade-in">
      <div
        className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center"
      >
        <div className="flex flex-col items-center">
          <Image
            src="/assets/images/advantage-1.png"
            alt="مشاوره تخصصی"
            className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3"
            width={112}
            height={112}
          />
          <h4 className="text-base sm:text-lg font-bold text-[#d4af37] mb-1">
            مشاوره تخصصی
          </h4>
          <p className="text-gray-300 text-xs sm:text-sm">
            تحلیل بازار، تدوین استراتژی کسب‌وکار و مشاوره عملی برای راه‌اندازی و رشد رستوران
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Image
            src="/assets/images/advantage-2.png"
            alt="طراحی و دیزاین حرفه‌ای"
            className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3"
            width={112}
            height={112}
          />
          <h4 className="text-base sm:text-lg font-bold text-[#d4af37] mb-1">
            طراحی و دیزاین حرفه‌ای
          </h4>
          <p className="text-gray-300 text-xs sm:text-sm">
            طراحی منو، چیدمان فضا، تامین تجهیزات و اجرای طرح‌های هویت بصری متناسب با کسب‌وکار
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Image
            src="/assets/images/advantage-3.png"
            alt="آموزش و راه‌اندازی صفر تا صد"
            className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3"
            width={112}
            height={112}
          />
          <h4 className="text-base sm:text-lg font-bold text-[#d4af37] mb-1">
            آموزش و راه‌اندازی صفر تا صد
          </h4>
          <p className="text-gray-300 text-xs sm:text-sm">
            آموزش پرسنل، استانداردهای عملیاتی، و پشتیبانی فنی تا رسیدن به بهره‌برداری کامل
          </p>
        </div>
      </div>
    </section>
  )
}