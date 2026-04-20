// Pure XP logic — no Prisma imports, fully testable

export interface LevelThreshold {
  level: number;
  name: string;
  minXp: number;
}

export interface LevelInfo {
  level: number;
  name: string;
  minXp: number;
  nextMinXp: number;
  nextLevelName: string | null;
  xpIntoLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
}

// 100 levels with grouped names.
// XP curve roughly follows 50 * n^1.8 with clean round numbers at group boundaries.
export const LEVELS: LevelThreshold[] = [
  // Lurker (1–5)
  { level: 1, name: "Lurker", minXp: 0 },
  { level: 2, name: "Lurker", minXp: 100 },
  { level: 3, name: "Lurker", minXp: 250 },
  { level: 4, name: "Lurker", minXp: 450 },
  { level: 5, name: "Lurker", minXp: 700 },
  // Listener (6–15)
  { level: 6, name: "Listener", minXp: 1_000 },
  { level: 7, name: "Listener", minXp: 1_500 },
  { level: 8, name: "Listener", minXp: 2_100 },
  { level: 9, name: "Listener", minXp: 2_800 },
  { level: 10, name: "Listener", minXp: 3_600 },
  { level: 11, name: "Listener", minXp: 4_500 },
  { level: 12, name: "Listener", minXp: 5_500 },
  { level: 13, name: "Listener", minXp: 6_600 },
  { level: 14, name: "Listener", minXp: 7_800 },
  { level: 15, name: "Listener", minXp: 9_100 },
  // Digger (16–25)
  { level: 16, name: "Digger", minXp: 10_500 },
  { level: 17, name: "Digger", minXp: 12_000 },
  { level: 18, name: "Digger", minXp: 13_600 },
  { level: 19, name: "Digger", minXp: 15_300 },
  { level: 20, name: "Digger", minXp: 17_100 },
  { level: 21, name: "Digger", minXp: 19_000 },
  { level: 22, name: "Digger", minXp: 21_000 },
  { level: 23, name: "Digger", minXp: 23_100 },
  { level: 24, name: "Digger", minXp: 25_300 },
  { level: 25, name: "Digger", minXp: 27_600 },
  // Curator (26–35)
  { level: 26, name: "Curator", minXp: 30_000 },
  { level: 27, name: "Curator", minXp: 32_500 },
  { level: 28, name: "Curator", minXp: 35_100 },
  { level: 29, name: "Curator", minXp: 37_800 },
  { level: 30, name: "Curator", minXp: 40_600 },
  { level: 31, name: "Curator", minXp: 43_500 },
  { level: 32, name: "Curator", minXp: 46_500 },
  { level: 33, name: "Curator", minXp: 49_600 },
  { level: 34, name: "Curator", minXp: 52_800 },
  { level: 35, name: "Curator", minXp: 56_100 },
  // Tastemaker (36–50)
  { level: 36, name: "Tastemaker", minXp: 59_500 },
  { level: 37, name: "Tastemaker", minXp: 63_000 },
  { level: 38, name: "Tastemaker", minXp: 66_600 },
  { level: 39, name: "Tastemaker", minXp: 70_300 },
  { level: 40, name: "Tastemaker", minXp: 74_100 },
  { level: 41, name: "Tastemaker", minXp: 78_000 },
  { level: 42, name: "Tastemaker", minXp: 82_000 },
  { level: 43, name: "Tastemaker", minXp: 86_100 },
  { level: 44, name: "Tastemaker", minXp: 90_300 },
  { level: 45, name: "Tastemaker", minXp: 94_600 },
  { level: 46, name: "Tastemaker", minXp: 99_000 },
  { level: 47, name: "Tastemaker", minXp: 103_500 },
  { level: 48, name: "Tastemaker", minXp: 108_100 },
  { level: 49, name: "Tastemaker", minXp: 112_800 },
  { level: 50, name: "Tastemaker", minXp: 117_600 },
  // Selector (51–65)
  { level: 51, name: "Selector", minXp: 122_500 },
  { level: 52, name: "Selector", minXp: 130_000 },
  { level: 53, name: "Selector", minXp: 137_700 },
  { level: 54, name: "Selector", minXp: 145_600 },
  { level: 55, name: "Selector", minXp: 153_700 },
  { level: 56, name: "Selector", minXp: 162_000 },
  { level: 57, name: "Selector", minXp: 170_500 },
  { level: 58, name: "Selector", minXp: 179_200 },
  { level: 59, name: "Selector", minXp: 188_100 },
  { level: 60, name: "Selector", minXp: 197_200 },
  { level: 61, name: "Selector", minXp: 206_500 },
  { level: 62, name: "Selector", minXp: 216_000 },
  { level: 63, name: "Selector", minXp: 225_700 },
  { level: 64, name: "Selector", minXp: 235_600 },
  { level: 65, name: "Selector", minXp: 245_700 },
  // Archivist (66–80)
  { level: 66, name: "Archivist", minXp: 256_000 },
  { level: 67, name: "Archivist", minXp: 270_000 },
  { level: 68, name: "Archivist", minXp: 284_300 },
  { level: 69, name: "Archivist", minXp: 298_900 },
  { level: 70, name: "Archivist", minXp: 313_800 },
  { level: 71, name: "Archivist", minXp: 329_000 },
  { level: 72, name: "Archivist", minXp: 344_500 },
  { level: 73, name: "Archivist", minXp: 360_300 },
  { level: 74, name: "Archivist", minXp: 376_400 },
  { level: 75, name: "Archivist", minXp: 392_800 },
  { level: 76, name: "Archivist", minXp: 409_500 },
  { level: 77, name: "Archivist", minXp: 426_500 },
  { level: 78, name: "Archivist", minXp: 443_800 },
  { level: 79, name: "Archivist", minXp: 461_400 },
  { level: 80, name: "Archivist", minXp: 479_300 },
  // Connoisseur (81–90)
  { level: 81, name: "Connoisseur", minXp: 497_500 },
  { level: 82, name: "Connoisseur", minXp: 520_000 },
  { level: 83, name: "Connoisseur", minXp: 543_000 },
  { level: 84, name: "Connoisseur", minXp: 566_500 },
  { level: 85, name: "Connoisseur", minXp: 590_500 },
  { level: 86, name: "Connoisseur", minXp: 615_000 },
  { level: 87, name: "Connoisseur", minXp: 640_000 },
  { level: 88, name: "Connoisseur", minXp: 665_500 },
  { level: 89, name: "Connoisseur", minXp: 691_500 },
  { level: 90, name: "Connoisseur", minXp: 718_000 },
  // Legend (91–99)
  { level: 91, name: "Legend", minXp: 745_000 },
  { level: 92, name: "Legend", minXp: 778_000 },
  { level: 93, name: "Legend", minXp: 811_500 },
  { level: 94, name: "Legend", minXp: 845_500 },
  { level: 95, name: "Legend", minXp: 880_000 },
  { level: 96, name: "Legend", minXp: 915_000 },
  { level: 97, name: "Legend", minXp: 950_500 },
  { level: 98, name: "Legend", minXp: 986_500 },
  { level: 99, name: "Legend", minXp: 1_023_000 },
  // Icon (100)
  { level: 100, name: "Icon", minXp: 1_060_000 },
];

export function getLevelFromXp(totalXp: number): LevelInfo {
  let current = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      break;
    }
  }

  const nextThreshold = LEVELS.find((l) => l.level === current.level + 1) ?? null;

  if (!nextThreshold) {
    // Max level
    return {
      level: current.level,
      name: current.name,
      minXp: current.minXp,
      nextMinXp: current.minXp,
      nextLevelName: null,
      xpIntoLevel: totalXp - current.minXp,
      xpNeededForNext: 0,
      progressPercent: 100,
    };
  }

  const xpIntoLevel = totalXp - current.minXp;
  const xpNeededForNext = nextThreshold.minXp - current.minXp;
  const progressPercent = Math.min(100, Math.floor((xpIntoLevel / xpNeededForNext) * 100));

  return {
    level: current.level,
    name: current.name,
    minXp: current.minXp,
    nextMinXp: nextThreshold.minXp,
    nextLevelName: nextThreshold.name,
    xpIntoLevel,
    xpNeededForNext,
    progressPercent,
  };
}

// XP award constants
export const XP_POST_FIND = 50;
export const XP_LIKE_RECEIVED = 10;
export const XP_FOLLOWER_GAINED = 15;
export const XP_STREAK_BONUS_PER_DAY = 20;

// Milestone XP — repeating cycle every 50 finds
export const MILESTONE_XP: Record<number, number> = {
  1: 100,
  10: 200,
  50: 500,
};

// Returns the cycle position within the repeating 50-find cycle.
// cyclePosition 1 = first in cycle, 10 = tenth, 50 = fiftieth.
export function getMilestoneCyclePosition(findCount: number): number {
  return ((findCount - 1) % 50) + 1;
}

// Returns the milestone XP for this find count, or null if not a milestone.
export function getMilestoneXp(findCount: number): number | null {
  const pos = getMilestoneCyclePosition(findCount);
  return MILESTONE_XP[pos] ?? null;
}

// Returns the effective streak considering staleness, using the same 36h window
// as updateStreak to handle timezone differences.
export function getEffectiveStreak(
  storedStreak: number,
  lastActivityDate: Date | null,
  now: Date = new Date()
): number {
  if (!lastActivityDate || storedStreak === 0) return storedStreak;
  const diffHours = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);
  if (diffHours < 36) return storedStreak;
  // Also allow if last activity was yesterday UTC
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const lastStr = lastActivityDate.toISOString().slice(0, 10);
  if (lastStr === yesterday.toISOString().slice(0, 10)) return storedStreak;
  return 0;
}

// Streak bonus grows unbounded — no cap.
export function computeStreakBonus(currentStreak: number): number {
  return XP_STREAK_BONUS_PER_DAY * currentStreak;
}

export interface StreakResult {
  newStreak: number;
  isNewDay: boolean;
}

// Uses a 36-hour window for "consecutive day" to handle timezone differences —
// a post at 23:00 local time may land on the next UTC date, so strict 24h would
// falsely break the streak for users east of UTC.
export function updateStreak(
  lastActivityDate: Date | null,
  now: Date = new Date()
): StreakResult {
  if (!lastActivityDate) {
    return { newStreak: 1, isNewDay: true };
  }

  const diffMs = now.getTime() - lastActivityDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    // Same effective day — no streak change, no bonus
    return { newStreak: -1, isNewDay: false };
  }

  if (diffHours < 36) {
    // Within 36h — counts as consecutive day
    return { newStreak: -1, isNewDay: true };
  }

  // Check if it's just the next UTC calendar day (covers remaining timezone edge cases)
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const lastStr = lastActivityDate.toISOString().slice(0, 10);

  if (lastStr === todayStr || lastStr === yesterdayStr) {
    return { newStreak: -1, isNewDay: true };
  }

  // Gap too large — reset
  return { newStreak: 1, isNewDay: true };
}
