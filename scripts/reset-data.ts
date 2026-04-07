import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Deleting all user data...');

  const savedArticles = await prisma.savedArticle.deleteMany({});
  console.log(`Deleted ${savedArticles.count} saved articles`);

  const likes = await prisma.like.deleteMany({});
  console.log(`Deleted ${likes.count} likes`);

  const follows = await prisma.follow.deleteMany({});
  console.log(`Deleted ${follows.count} follows`);

  const finds = await prisma.spotifyFind.deleteMany({});
  console.log(`Deleted ${finds.count} finds`);

  const users = await prisma.user.deleteMany({});
  console.log(`Deleted ${users.count} users`);

  console.log('Done. Database is clean.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
