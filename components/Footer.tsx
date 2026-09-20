export default function Footer() {
  return (
    <div
      // RESPONSIVE FIX: Keep footer content above the fixed mobile shortcut bar.
      className="pb-[calc(5rem+env(safe-area-inset-bottom))] pt-4 sm:py-6 sm:pb-6 bg-gray-900 text-center text-gray-400 text-xs sm:text-sm fade-in"
    >
      © 2026 فراز برتر رامونا. تمامی حقوق محفوظ است.
    </div>

  )
}