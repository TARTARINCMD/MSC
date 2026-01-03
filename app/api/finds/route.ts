import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Return all finds from all users (public feed)
    const finds = await prisma.spotifyFind.findMany({
      orderBy: { dateAdded: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: { likes: true },
        },
        likes: userId ? {
          where: { userId: userId },
          select: { id: true },
        } : false,
      },
    });

    // Transform to include like count and whether current user liked
    const findsWithLikes = finds.map((find) => ({
      ...find,
      likeCount: find._count.likes,
      liked: userId ? (find.likes as { id: string }[]).length > 0 : false,
      _count: undefined,
      likes: undefined,
    }));

    return NextResponse.json(findsWithLikes);
  } catch (error) {
    console.error("Error fetching finds:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { title, artist, type, spotifyUrl, spotifyId, imageUrl, description, genre } = data;

    if (!title || !artist || !type || !spotifyUrl || !spotifyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const find = await prisma.spotifyFind.create({
      data: {
        title,
        artist,
        type,
        spotifyUrl,
        spotifyId,
        imageUrl: imageUrl || null,
        description: description || null,
        genre: genre || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(find, { status: 201 });
  } catch (error) {
    console.error("Error creating find:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
