// app/api/payment/webhook/route.ts
import { NextResponse } from "next/server";

// A public request must never be able to impersonate a payment provider.
export async function POST() {
  return NextResponse.json(
    { error: "Payment webhooks are not configured. Use the demo confirmation flow." },
    { status: 410 },
  );
}
