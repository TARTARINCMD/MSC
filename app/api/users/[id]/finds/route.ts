import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;

    const finds = await prisma.spotifyFind.findMany({
      where: { userId },
      orderBy: { dateAdded: "desc" },
      select: {
        id: true,
        title: true,
        artist: true,
        type: true,
        spotifyUrl: true,
        imageUrl: true,
        dateAdded: true,
      },
    });

    return NextResponse.json(finds);
  } catch (error) {
    console.error("Error fetching user finds:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
