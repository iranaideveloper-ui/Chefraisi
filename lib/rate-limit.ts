import { NextResponse } from "next/server";

type RateLimitEntry = {
  timestamps: number[];
  lastSeen: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
};

const CLEANUP_INTERVAL_MS = 60 * 1000;
const MAX_WINDOW_MS = 15 * 60 * 1000;
const globalState = globalThis as typeof globalThis & {
  __chefRaisiRateLimitStore?: Map<string, RateLimitEntry>;
  __chefRaisiRateLimitLastCleanup?: number;
};

const store: Map<string, RateLimitEntry> = globalState.__chefRaisiRateLimitStore ??= new Map<string, RateLimitEntry>();

function cleanupExpiredEntries(now: number) {
  const lastCleanup = globalState.__chefRaisiRateLimitLastCleanup ?? 0;
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  for (const [key, entry] of store) {
    if (now - entry.lastSeen > MAX_WINDOW_MS) store.delete(key);
  }
  globalState.__chefRaisiRateLimitLastCleanup = now;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  return forwardedIp || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const existing = store.get(key);
  if (!existing) {
    store.set(key, { timestamps: [now], lastSeen: now });
    return { allowed: true, retryAfter: Math.ceil(windowMs / 1000) };
  }

  const windowStart = now - windowMs;
  existing.timestamps = existing.timestamps.filter((timestamp) => timestamp > windowStart);
  existing.lastSeen = now;
  if (existing.timestamps.length >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.timestamps[0] + windowMs - now) / 1000)),
    };
  }

  existing.timestamps.push(now);
  return { allowed: true, retryAfter: Math.max(1, Math.ceil((existing.timestamps[0] + windowMs - now) / 1000)) };
}

export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    {
      success: false,
      error: "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً چند دقیقه دیگر تلاش کنید.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}

export function enforceRateLimit(options: RateLimitOptions) {
  const result = checkRateLimit(options);
  return result.allowed ? null : rateLimitResponse(result.retryAfter);
}