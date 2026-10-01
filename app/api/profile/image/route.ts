import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { profileImageUrl } from "@/lib/blob";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.searchParams.get("path");
  if (!pathname || !/^(avatars|covers)\/\d+\/[^/]+$/.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const imageUrl = profileImageUrl(pathname);
  const profile = await prisma.profile.findFirst({
    where: {
      OR: [{ avatarImage: imageUrl }, { backgroundImage: imageUrl }],
    },
    select: { id: true },
  });

  if (!profile) return new NextResponse(null, { status: 404 });

  try {
    const image = await get(pathname, { access: "private" });
    if (!image || image.statusCode !== 200) {
      return new NextResponse(null, { status: 404 });
    }

    if (!image.blob.contentType.startsWith("image/")) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(image.stream, {
      headers: {
        "Content-Type": image.blob.contentType,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[profile image]", error);
    return new NextResponse(null, { status: 500 });
  }
}
