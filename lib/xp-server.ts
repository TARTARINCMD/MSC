import { PrismaClient, XpEventType } from "@prisma/client";
import {
  XP_POST_FIND,
  XP_LIKE_RECEIVED,
  XP_FOLLOWER_GAINED,
  XP_STREAK_BONUS_PER_DAY,
  getMilestoneXp,
  computeStreakBonus,
  updateStreak,
} from "@/lib/xp";

type PrismaInstance = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

async function awardXp(
  userId: string,
  eventType: XpEventType,
  xpAmount: number,
  prisma: PrismaInstance,
  metadata?: Record<string, unknown>
) {
  await prisma.$transaction(async (tx: PrismaInstance) => {
    await tx.userXP.upsert({
      where: { userId },
      create: { userId, totalXp: xpAmount },
      update: { totalXp: { increment: xpAmount } },
    });
    await tx.xpEvent.create({
      data: {
        userId,
        eventType,
        xpAmount,
        metadata: metadata ?? null,
      },
    });
  });
}

export async function handlePostFindXp(userId: string, prisma: PrismaClient) {
  // Count total finds for this user
  const findCount = await prisma.spotifyFind.count({ where: { userId } });

  // Award base XP for the post
  await awardXp(userId, XpEventType.POST_FIND, XP_POST_FIND, prisma);

  // Check milestone (repeating cycle every 50 finds)
  const milestoneXp = getMilestoneXp(findCount);
  if (milestoneXp !== null) {
    // Deduplicate: only award if no milestone event exists for this exact findCount
    const existing = await prisma.xpEvent.findFirst({
      where: {
        userId,
        eventType: XpEventType.MILESTONE,
        metadata: { path: ["findCount"], equals: findCount },
      },
    });
    if (!existing) {
      await awardXp(userId, XpEventType.MILESTONE, milestoneXp, prisma, { findCount });
    }
  }

  // Streak handling
  const userXp = await prisma.userXP.findUnique({ where: { userId } });
  const lastActivity = userXp?.lastActivityDate ?? null;
  const now = new Date();
  const { newStreak, isNewDay } = updateStreak(lastActivity, now);

  if (isNewDay) {
    let currentStreak: number;
    if (newStreak === -1) {
      // Increment existing streak
      currentStreak = (userXp?.currentStreak ?? 0) + 1;
    } else {
      // Reset to 1
      currentStreak = 1;
    }
    const longestStreak = Math.max(userXp?.longestStreak ?? 0, currentStreak);

    await prisma.userXP.upsert({
      where: { userId },
      create: {
        userId,
        totalXp: 0,
        currentStreak,
        longestStreak,
        lastActivityDate: now,
      },
      update: {
        currentStreak,
        longestStreak,
        lastActivityDate: now,
      },
    });

    const streakBonus = computeStreakBonus(currentStreak);
    await awardXp(userId, XpEventType.STREAK_BONUS, streakBonus, prisma);
  }
}

export async function handleLikeReceivedXp(findOwnerId: string, prisma: PrismaClient) {
  await awardXp(findOwnerId, XpEventType.LIKE_RECEIVED, XP_LIKE_RECEIVED, prisma);
}

export async function handleFollowerGainedXp(followedUserId: string, prisma: PrismaClient) {
  await awardXp(followedUserId, XpEventType.FOLLOWER_GAINED, XP_FOLLOWER_GAINED, prisma);
}
