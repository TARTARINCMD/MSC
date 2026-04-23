import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const email = 'sidukovruslan20022@gmail.com';

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  // Count distinct posting days since April 17
  const finds = await prisma.spotifyFind.findMany({
    where: { userId: user.id, dateAdded: { gte: new Date('2026-04-17T00:00:00Z') } },
    select: { dateAdded: true },
    orderBy: { dateAdded: 'asc' },
  });

  const days = new Set(finds.map(f => f.dateAdded.toISOString().slice(0, 10)));
  console.log('Posting days found:', [...days].sort());

  const streak = days.size;
  const lastActivityDate = finds[finds.length - 1]?.dateAdded ?? new Date();

  const updated = await prisma.userXP.update({
    where: { userId: user.id },
    data: {
      currentStreak: streak,
      longestStreak: streak,
      lastActivityDate,
    },
  });

  console.log(`Streak set to ${streak}, lastActivityDate = ${lastActivityDate.toISOString()}`);
  console.log('Updated record:', updated);
}

main().catch(console.error).finally(() => prisma.$disconnect());
