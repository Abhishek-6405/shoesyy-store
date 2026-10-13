import { NextResponse } from "next/server";
import { isRazorpayConfigured, razorpayKeyId } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      enabled: isRazorpayConfigured,
      keyId: isRazorpayConfigured ? razorpayKeyId : null,
      currency: "INR",
    },
  });
}
