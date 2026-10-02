// app/[username]/page.tsx
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await getSessionUser();

  const creator = await prisma.user.findUnique({
    where: { username },
    include: {
      Profile: true,
      Donation_Donation_recipientIdToUser: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          User_Donation_donorIdToUser: {
            include: {
              Profile: true,
            },
          },
        },
      },
    },
  });

  if (!creator) notFound();

  const isOwner = session?.userId === creator.id;

  return (
    <ProfileClient creator={creator} isOwner={isOwner} />
  );
}
