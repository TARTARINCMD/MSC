import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const finds = await prisma.spotifyFind.findMany({
      where: { userId },
      orderBy: { dateAdded: "desc" },
      select: {
        id: true,
        title: true,
        artist: true,
        type: true,
        genre: true,
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
