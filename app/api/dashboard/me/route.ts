import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeCurrentUser } from "@/lib/api-data";

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      Profile: true,
      BankCard: true,
      Donation_Donation_recipientIdToUser: {
        orderBy: { createdAt: "desc" },
        include: {
          User_Donation_donorIdToUser: {
            select: {
              username: true,
              Profile: { select: { name: true, avatarImage: true } },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const currentUser = serializeCurrentUser(user);
  const donations = user.Donation_Donation_recipientIdToUser.map(
    ({ User_Donation_donorIdToUser: donor, ...donation }) => ({
      ...donation,
      donor: {
        username: donor?.username ?? "guest",
        name: donor?.Profile.name ?? "Guest supporter",
        avatarImage: donor?.Profile.avatarImage ?? "",
      },
    }),
  );

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    user: {
      id: currentUser.id,
      email: currentUser.email,
      username: currentUser.username,
      profile: currentUser.profile,
    },
    donations,
    totalEarnings: donations.reduce(
      (total, donation) => total + donation.amount,
      0,
    ),
    supporterCount: new Set(
      donations.map((donation) => donation.donorId ?? `guest-${donation.id}`),
    ).size,
  });
}
