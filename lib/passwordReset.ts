import crypto from "crypto";

export const RESET_CODE_TTL_MS = 10 * 60 * 1000;
export const RESET_CODE_COOLDOWN_MS = 60 * 1000;
export const MAX_RESET_ATTEMPTS = 5;

export function createResetCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashResetCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

const melliPayamakEndpoint = "https://api.payamak-panel.com/post/Send.asmx/SendSimpleSMS2";

function getMelliPayamakCredentials() {
  const username = process.env.MELIPAYAMAK_USERNAME;
  const password = process.env.MELIPAYAMAK_PASSWORD;
  const from = process.env.MELIPAYAMAK_FROM;
  return username && password && from ? { username, password, from } : null;
}

export async function sendMelliPayamakSms(mobile: string, message: string) {
  const credentials = getMelliPayamakCredentials();
  if (!credentials) throw new Error("تنظیمات ملی‌پیامک کامل نیست");

  const body = new URLSearchParams({
    username: credentials.username,
    password: credentials.password,
    from: credentials.from,
    to: mobile,
    text: message,
    isflash: "false",
  });
  const response = await fetch(melliPayamakEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const responseText = await response.text();
  const returnValue = (responseText.match(/<string\b[^>]*>([\s\S]*?)<\/string>/i)?.[1] ?? responseText)
    .trim()
    .replace(/^['"]|['"]$/g, "");
  const sendId = Number(returnValue);

  if (!response.ok || !Number.isSafeInteger(sendId) || sendId <= 0) {
    throw new Error(`ارسال ملی‌پیامک ناموفق بود (HTTP ${response.status}، کد ${returnValue.slice(0, 32) || "بدون پاسخ"})`);
  }
}

export async function sendResetCode(mobile: string, code: string) {
  if (!getMelliPayamakCredentials() && process.env.NODE_ENV !== "production") {
    console.info(`[password-reset] development code for ${mobile}: ${code}`);
    return;
  }

  await sendMelliPayamakSms(mobile, `کد تایید بازیابی رمز عبور شما: ${code}\nاین کد تا ۱۰ دقیقه معتبر است.`);
}

export async function sendTemporaryPassword(mobile: string, password: string) {
  await sendMelliPayamakSms(mobile, `رمز عبور جدید شما: ${password}`);
}