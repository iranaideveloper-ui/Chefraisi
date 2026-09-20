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

export async function sendResetCode(mobile: string, code: string) {
  const smsApiUrl = process.env.SMS_API_URL;
  const smsApiKey = process.env.SMS_API_KEY;

  if (!smsApiUrl || !smsApiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("سرویس پیامک تنظیم نشده است");
    }

    console.info(`[password-reset] development code for ${mobile}: ${code}`);
    return;
  }

  const response = await fetch(smsApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${smsApiKey}`,
    },
    body: JSON.stringify({
      mobile,
      message: `کد تایید بازیابی رمز عبور شما: ${code}`,
    }),
  });

  if (!response.ok) {
    const providerMessage = await response.text().catch(() => "");
    throw new Error(`SMS provider returned ${response.status}: ${providerMessage.slice(0, 200)}`);
  }
}