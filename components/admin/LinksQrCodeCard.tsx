'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, Download, ExternalLink, Check } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const fallbackLinksPath = '/links';

export default function LinksQrCodeCard() {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [linksUrl, setLinksUrl] = useState(fallbackLinksPath);
  const [copied, setCopied] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    setLinksUrl(`${window.location.origin}${fallbackLinksPath}`);
  }, []);

  const handleCopy = async () => {
    setDownloadError('');
    try {
      await navigator.clipboard.writeText(linksUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setDownloadError('کپی لینک انجام نشد؛ لینک را به‌صورت دستی انتخاب کنید.');
    }
  };

  const handleDownload = () => {
    setDownloadError('');
    const canvas = qrCanvasRef.current;
    if (!canvas) {
      setDownloadError('تصویر QR هنوز آماده نشده است.');
      return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = 'faraz-links-qrcode.png';
    downloadLink.click();
  };

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-amber-500/30 bg-neutral-950 text-neutral-100 shadow-lg shadow-black/10">
      <div className="bg-linear-to-r from-neutral-950 via-amber-950/30 to-neutral-950 p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-amber-400">دسترسی سریع</p>
            <h2 className="mt-1 text-xl font-bold text-white">QR صفحه لینک‌ها</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-400">
              این کد را برای چاپ یا اشتراک‌گذاری در اختیار مخاطبان قرار دهید.
            </p>
          </div>
          <ExternalLink className="h-5 w-5 text-amber-400" aria-hidden="true" />
        </div>

        <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
          <div className="mx-auto rounded-xl bg-white p-4 shadow-[0_0_28px_rgba(245,158,11,0.2)]">
            <QRCodeCanvas
              value={linksUrl}
              size={220}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#111111"
              imageSettings={{
                src: '/assets/images/faraz-logo.png',
                height: 36,
                width: 36,
                excavate: true,
              }}
              ref={qrCanvasRef}
            />
          </div>

          <div className="min-w-0 space-y-4">
            <div>
              <label htmlFor="links-page-url" className="mb-2 block text-sm font-semibold text-amber-300">
                آدرس صفحه
              </label>
              <input
                id="links-page-url"
                value={linksUrl}
                readOnly
                dir="ltr"
                className="w-full min-w-0 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-left text-sm text-neutral-300 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-neutral-950 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                دانلود تصویر QR
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-500/50 px-4 py-2 text-sm font-bold text-amber-300 transition hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? 'کپی شد!' : 'کپی لینک'}
              </button>
            </div>
            {downloadError && <p className="text-sm text-red-300">{downloadError}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
