import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    const currentUserId = authUser?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        followers: {
          select: { followerId: true },
        },
        following: {
          select: { followingId: true },
        },
        finds: {
          select: { genre: true },
        },
      },
    });

    const formattedUsers = users.map((user) => {
      const genreCounts: Record<string, number> = {};
      for (const find of user.finds) {
        if (find.genre) {
          genreCounts[find.genre] = (genreCounts[find.genre] ?? 0) + 1;
        }
      }
      const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);

      return {
        id: user.id,
        name: user.name,
        isOwnProfile: user.id === currentUserId,
        isFollowing: user.followers.some((f) => f.followerId === currentUserId),
        followersCount: user.followers.length,
        followingCount: user.following.length,
        topGenres,
        findCount: user.finds.length,
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
