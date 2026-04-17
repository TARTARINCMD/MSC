import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";
import { handleLikeReceivedXp } from "@/lib/xp-server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: findId } = await params;

    // Check if find exists
    const find = await prisma.spotifyFind.findUnique({
      where: { id: findId },
    });

    if (!find) {
      return NextResponse.json({ error: "Find not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_findId: {
          userId: user.id,
          findId: findId,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      const likeCount = await prisma.like.count({
        where: { findId: findId },
      });

      return NextResponse.json({ liked: false, likeCount });
    } else {
      // Like - create new like
      await prisma.like.create({
        data: {
          userId: user.id,
          findId: findId,
        },
      });

      Promise.resolve()
        .then(() => handleLikeReceivedXp(find.userId, prisma))
        .catch(console.error);

      const likeCount = await prisma.like.count({
        where: { findId: findId },
      });

      return NextResponse.json({ liked: true, likeCount });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    const { id: findId } = await params;

    const likeCount = await prisma.like.count({
      where: { findId: findId },
    });

    let liked = false;
    if (authUser?.id) {
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_findId: {
            userId: authUser.id,
            findId: findId,
          },
        },
      });
      liked = !!existingLike;
    }

    return NextResponse.json({ liked, likeCount });
  } catch (error) {
    console.error("Error getting like status:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

