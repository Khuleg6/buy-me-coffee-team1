import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { transactionId } = await request.json();
    if (typeof transactionId !== "string" || !/^[0-9a-f-]{36}$/i.test(transactionId)) {
      return NextResponse.json({ error: "Invalid donation link" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (db) => {
      const transaction = await db.transaction.findUnique({ where: { id: transactionId } });
      if (!transaction || transaction.paymentType !== "DEMO_QR" || !transaction.recipientId) {
        return { status: "NOT_FOUND" as const };
      }
      if (transaction.status === "COMPLETED") {
        return { status: "COMPLETED" as const };
      }

      const claimed = await db.transaction.updateMany({
        where: { id: transactionId, status: "PENDING" },
        data: { status: "COMPLETED" },
      });
      if (claimed.count === 0) return { status: "ALREADY_CLAIMED" as const };

      await db.donation.create({
        data: {
          amount: Math.round(transaction.amount),
          specialMessage: transaction.specialMessage,
          socialURLOrBuyMeCoffee: transaction.socialURLOrBuyMeCoffee,
          donorId: transaction.donorId,
          recipientId: transaction.recipientId,
          transactionId: transaction.id,
          updatedAt: new Date(),
        },
      });
      return { status: "COMPLETED" as const };
    });

    if (result.status === "NOT_FOUND") {
      return NextResponse.json({ error: "Donation link not found" }, { status: 404 });
    }
    if (result.status === "ALREADY_CLAIMED") {
      return NextResponse.json({ error: "Donation is already being confirmed" }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[demo donation complete]", error);
    return NextResponse.json({ error: "Could not confirm demo donation" }, { status: 500 });
  }
}
