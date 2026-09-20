"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const defaultAddress = "تهران، ستارخان، بین توحیدی و تهران ویلا (محله تهران ویلا)";

export default function Location() {
  const [address, setAddress] = useState(defaultAddress);
  useEffect(() => { fetch("/api/site-settings", { cache: "no-store" }).then((response) => response.json()).then((result) => { if (result.settings?.address) setAddress(result.settings.address); }).catch(() => undefined); }, []);
  return (
    <section
      className="py-10 sm:py-14 bg-gray-900 flex flex-col items-center justify-center fade-in"
    >
      <h2
        className="text-2xl sm:text-3xl font-bold text-[#d4af37] mb-4 text-center"
      >
        مکان ما روی نقشه
      </h2>
      <div
        className="w-full max-w-300 mx-auto flex flex-col items-center bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8 border border-[#d4af37]"
      >
        <div className="w-full flex flex-col md:flex-row items-center gap-6">
          {/* نقشه عریض‌تر */}
          <div className="flex-1 md:w-1/2">
            <iframe
              src="https://www.google.com/maps?q=35.7196944,51.3623611&hl=fa&z=16&output=embed"
              width="100%"
              height="340"
              style={{
                border: 0,
                borderRadius: "1rem",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="مکان کافه رستوران فراز برتر رامونا روی نقشه"
            ></iframe>
          </div>
          <div className="md:w-1/2">
            {/* توضیحات و آدرس */}
            <div className="flex-1 w-full flex flex-col items-end text-right">
              <span
                className="inline-block w-10 h-10 mb-2 text-[#d4af37] self-start text-right"
              >
                {/* Location SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-10 h-10 self-end text-right"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 10c-4.418 0-8-4.03-8-9a8 8 0 1116 0c0 4.97-3.582 9-8 9z"
                  />
                </svg>
              </span>
              <h3
                className="text-lg sm:text-xl font-bold text-[#d4af37] mb-2 self-start text-right"
              >
                آدرس شرکت فراز برتر رامونا
              </h3>
              <p
                className="text-gray-300 w-full text-sm sm:text-base leading-relaxed text-right"
              >
                {address}
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=35.7196944,51.3623611"
                target="_blank"
                rel="noopener"
                className="mt-3 inline-block bg-[#d4af37] text-gray-900 font-bold py-2 px-5 rounded-lg shadow hover:bg-[rgba(212,175,55,0.8)] transition text-xs sm:text-sm self-start text-right"
              >
                مشاهده در نقشه گوگل
              </a>
            </div>
            <div className="mt-6 flex flex-row items-center justify-center gap-6 sm:justify-end sm:pr-4" dir="ltr">
              <Image
                src="/assets/images/faraz-logo.png"
                alt="لوگوی فراز برتر رامونا"
                width={220}
                height={220}
                className="h-44 w-44 object-contain sm:h-52 sm:w-52"
              />
              <div className="flex flex-row gap-6">
                <a
                  href="https://balad.ir/p/rbvkLS_x4QW8?preview=true#15/35.720/51.363"
                  target="_blank"
                  rel="noopener"
                  title="نمایش در بلد"
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white/50 p-2 shadow-lg transition hover:bg-[#d4af37]"
                >
                  <Image src="/assets/images/بلد.png" alt="بلد" className="mb-1 h-10 w-10" width={128} height={128} />
                </a>
                <a
                  href="https://neshan.org/maps/places/rbvkLS_x4QW8#c35.720-51.363"
                  target="_blank"
                  rel="noopener"
                  title="نمایش در نشان"
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white/50 p-2 shadow-lg transition hover:bg-[#d4af37]"
                >
                  <Image
                    src="/assets/images/نشان.png"
                    alt="نشان"
                    className="mb-1 h-10 w-10"
                    width={128}
                    height={128}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}