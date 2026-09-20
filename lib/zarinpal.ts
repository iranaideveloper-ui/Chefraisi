const merchantId = process.env.ZARINPAL_MERCHANT_ID?.trim();
const isSandbox = process.env.ZARINPAL_SANDBOX === "true";

export function getZarinpalConfig() {
  const host = isSandbox ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
  return {
    merchantId,
    isConfigured: Boolean(merchantId),
    requestUrl: `${host}/pg/v4/payment/request.json`,
    verifyUrl: `${host}/pg/v4/payment/verify.json`,
    startPayUrl: isSandbox ? "https://sandbox.zarinpal.com/pg/StartPay" : "https://www.zarinpal.com/pg/StartPay",
  };
}

export function getPaymentCallbackUrl(requestUrl: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(requestUrl).origin;
  return `${baseUrl}/api/payments/zarinpal/callback`;
}
