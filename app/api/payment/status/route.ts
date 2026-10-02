import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get("transactionId");

  if (!transactionId) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { id: true, status: true, amount: true, recipientId: true },
  });

  if (!transaction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const creator = transaction.recipientId
    ? await prisma.user.findUnique({
        where: { id: transaction.recipientId },
        select: { username: true, Profile: { select: { name: true } } },
      })
    : null;
  return NextResponse.json({
    id: transaction.id,
    status: transaction.status,
    amount: transaction.amount,
    creatorName: creator?.Profile.name || creator?.username || "Creator",
  });
}
