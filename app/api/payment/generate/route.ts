// app/api/payment/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const recipientId = Number(body.recipientId);
    const specialMessage = String(body.specialMessage ?? "").trim();
    const socialURLOrBuyMeCoffee = String(body.socialURLOrBuyMeCoffee ?? "").trim();
    const donorId = getUserIdFromRequest(request);

    if (
      ![1, 2, 5, 10].includes(amount) ||
      !Number.isSafeInteger(recipientId) ||
      recipientId <= 0 ||
      socialURLOrBuyMeCoffee.length < 4 ||
      socialURLOrBuyMeCoffee.length > 500 ||
      specialMessage.length > 1000
    ) {
      return NextResponse.json({ error: "Invalid donation details" }, { status: 400 });
    }
    if (donorId === recipientId) {
      return NextResponse.json({ error: "You cannot support your own page" }, { status: 400 });
    }

    const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } });
    if (!recipient) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        status: "PENDING",
        paymentType: "DEMO_QR",
        recipientId,
        donorId,
        specialMessage,
        socialURLOrBuyMeCoffee,
      },
    });
    const configuredBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
    const requestHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
      || request.headers.get("host");
    const requestProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
      || new URL(request.url).protocol.replace(":", "");
    const origin = configuredBase
      ? new URL(configuredBase).origin
      : requestHost
        ? new URL(`${requestProtocol}://${requestHost}`).origin
        : new URL(request.url).origin;
    const paymentUrl = new URL(`/pay/${transaction.id}`, origin).toString();
    const qrCodeUrl = await QRCode.toDataURL(paymentUrl);

    return NextResponse.json({ transactionId: transaction.id, qrCodeUrl, paymentUrl });
  } catch (error) {
    console.error("[demo QR generate]", error);
    return NextResponse.json({ error: "Could not create QR code" }, { status: 500 });
  }
}
