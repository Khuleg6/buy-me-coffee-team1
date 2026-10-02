import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const donations = await prisma.donation.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      User_Donation_donorIdToUser: {
        select: {
          username: true,
          Profile: { select: { name: true, avatarImage: true } },
        },
      },
    },
  });

  return NextResponse.json(
    donations.map(({ User_Donation_donorIdToUser: donor, ...donation }) => ({
      ...donation,
      donor: {
        username: donor?.username ?? "guest",
        name: donor?.Profile.name ?? "Guest supporter",
        avatarImage: donor?.Profile.avatarImage ?? "",
      },
    })),
  );
}
