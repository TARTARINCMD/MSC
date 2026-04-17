import { Prisma } from "@prisma/client";
import {
  XP_POST_FIND,
  XP_LIKE_RECEIVED,
  XP_FOLLOWER_GAINED,
  getMilestoneXp,
  computeStreakBonus,
  updateStreak,
} from "@/lib/xp";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

const XpEventType = {
  POST_FIND: "POST_FIND",
  LIKE_RECEIVED: "LIKE_RECEIVED",
  FOLLOWER_GAINED: "FOLLOWER_GAINED",
  STREAK_BONUS: "STREAK_BONUS",
  MILESTONE: "MILESTONE",
} as const;
type XpEventType = (typeof XpEventType)[keyof typeof XpEventType];

async function awardXp(
  userId: string,
  eventType: XpEventType,
  xpAmount: number,
  db: DB,
  metadata?: Record<string, unknown>
) {
  await db.userXP.upsert({
    where: { userId },
    create: { userId, totalXp: xpAmount },
    update: { totalXp: { increment: xpAmount } },
  });
  await db.xpEvent.create({
    data: {
      userId,
      eventType,
      xpAmount,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });
}

export async function handlePostFindXp(userId: string, db: DB) {
  const findCount = await db.spotifyFind.count({ where: { userId } });

  await awardXp(userId, XpEventType.POST_FIND, XP_POST_FIND, db);

  const milestoneXp = getMilestoneXp(findCount);
  if (milestoneXp !== null) {
    const existing = await db.xpEvent.findFirst({
      where: {
        userId,
        eventType: XpEventType.MILESTONE,
        metadata: { path: ["findCount"], equals: findCount },
      },
    });
    if (!existing) {
      await awardXp(userId, XpEventType.MILESTONE, milestoneXp, db, { findCount });
    }
  }

  const userXp = await db.userXP.findUnique({ where: { userId } });
  const lastActivity = userXp?.lastActivityDate ?? null;
  const now = new Date();
  const { newStreak, isNewDay } = updateStreak(lastActivity, now);

  if (isNewDay) {
    const currentStreak = newStreak === -1 ? (userXp?.currentStreak ?? 0) + 1 : 1;
    const longestStreak = Math.max(userXp?.longestStreak ?? 0, currentStreak);

    await db.userXP.upsert({
      where: { userId },
      create: { userId, totalXp: 0, currentStreak, longestStreak, lastActivityDate: now },
      update: { currentStreak, longestStreak, lastActivityDate: now },
    });

    await awardXp(userId, XpEventType.STREAK_BONUS, computeStreakBonus(currentStreak), db);
  }
}

export async function handleLikeReceivedXp(findOwnerId: string, db: DB) {
  await awardXp(findOwnerId, XpEventType.LIKE_RECEIVED, XP_LIKE_RECEIVED, db);
}

export async function handleFollowerGainedXp(followedUserId: string, db: DB) {
  await awardXp(followedUserId, XpEventType.FOLLOWER_GAINED, XP_FOLLOWER_GAINED, db);
}
