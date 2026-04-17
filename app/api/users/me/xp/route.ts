import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getLevelFromXp } from "@/lib/xp";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.id;

    const [userXp, user, findsCount, likesReceived, followersCount] = await Promise.all([
      prisma.userXP.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
      prisma.spotifyFind.count({ where: { userId } }),
      prisma.like.count({ where: { find: { userId } } }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);

    const totalXp = userXp?.totalXp ?? 0;
    const levelInfo = getLevelFromXp(totalXp);

    return NextResponse.json({
      totalXp,
      currentStreak: userXp?.currentStreak ?? 0,
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
      joinedAt: user?.createdAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching own XP:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
