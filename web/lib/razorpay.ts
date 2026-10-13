import Razorpay from "razorpay";
import crypto from "crypto";

export const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
export const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

export const isRazorpayConfigured = Boolean(
  razorpayKeyId &&
  razorpayKeySecret &&
  razorpayKeyId !== "rzp_test_yourKeyIdHere" &&
  razorpayKeySecret !== "yourRazorpaySecretKeyHere"
);

export const razorpayInstance = isRazorpayConfigured
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null;

/**
 * Creates a Razorpay order in test/live mode.
 * @param amountInINR Amount in Indian Rupees
 * @param receipt Unique receipt identifier
 */
export async function createRazorpayOrder(amountInINR: number, receipt: string) {
  if (!razorpayInstance || !isRazorpayConfigured) {
    throw new Error("Razorpay is not configured on this server");
  }

  // Razorpay accepts amounts in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(amountInINR * 100);

  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt,
    payment_capture: 1,
  };

  const order = await razorpayInstance.orders.create(options);
  return order;
}

/**
 * Verifies Razorpay payment signature using HMAC SHA256
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!razorpayKeySecret) return false;

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(body.toString())
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(signature, "utf8");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
