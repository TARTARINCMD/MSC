import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const follows = await prisma.follow.findMany({
      where: { followerId: id },
      select: {
        following: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const currentUserId = authUser.id;
    const followingIds = new Set(
      (await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      })).map((f) => f.followingId)
    );

    const following = follows.map(({ following }) => ({
      id: following.id,
      name: following.name,
      isOwnProfile: following.id === currentUserId,
      isFollowing: followingIds.has(following.id),
    }));

    return NextResponse.json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
