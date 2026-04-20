import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getLevelFromXp, getEffectiveStreak } from "@/lib/xp";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;

    const [userXp, user, findsCount, likesReceived, followersCount, followingCount] = await Promise.all([
      prisma.userXP.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
      prisma.spotifyFind.count({ where: { userId } }),
      prisma.like.count({ where: { find: { userId } } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    const totalXp = userXp?.totalXp ?? 0;
    const levelInfo = getLevelFromXp(totalXp);
    const currentStreak = getEffectiveStreak(
      userXp?.currentStreak ?? 0,
      userXp?.lastActivityDate ?? null
    );

    return NextResponse.json({
      totalXp,
      currentStreak,
      longestStreak: userXp?.longestStreak ?? 0,
      level: levelInfo.level,
      levelName: levelInfo.name,
      progressPercent: levelInfo.progressPercent,
      xpIntoLevel: levelInfo.xpIntoLevel,
      xpNeededForNext: levelInfo.xpNeededForNext,
      nextLevelName: levelInfo.nextLevelName,
      findsCount,
      likesReceivedCount: likesReceived,
      followersCount,
      followingCount,
      joinedAt: user?.createdAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching user XP:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
