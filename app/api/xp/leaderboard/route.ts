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

    const topXp = await prisma.userXP.findMany({
      orderBy: { totalXp: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const leaderboard = topXp.map((entry, index) => {
      const levelInfo = getLevelFromXp(entry.totalXp);
      return {
        rank: index + 1,
        userId: entry.userId,
        name: entry.user.name || entry.user.email.split("@")[0],
        totalXp: entry.totalXp,
        level: levelInfo.level,
        levelName: levelInfo.name,
      };
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
