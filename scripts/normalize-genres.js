const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return "";
  const env = fs.readFileSync(envPath, "utf8");
  const match = env.match(/^DATABASE_URL\s*=\s*"(.*)"\s*$/m);
  return match ? match[1] : "";
}

const connectionString = loadDatabaseUrl();
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to .env or the environment.");
}

const pool = new Pool({
  connectionString,
  ssl: true,
  max: 10,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MAPPING = {
  "alternative": "Alternative",
  "jazz": "Jazz",
  "fusion": "Fusion",
  "brazilian": "Brazilian",
  "rnb": "R&B",
  "soft rock": "Soft Rock",
  "experimental hip hop": "Experimental Hip Hop",
  "funky japanese jazz": "Japanese Jazz",
  "alt folk": "Alt Folk",
  "alt rock": "Alternative Rock",
};

function normalizeKey(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\w& ]+/g, "")
    .replace(/\s+/g, " ");
}

async function run() {
  const finds = await prisma.spotifyFind.findMany({
    where: {
      genre: {
        not: null,
      },
    },
    select: {
      id: true,
      genre: true,
    },
  });

  let updatedCount = 0;

  for (const find of finds) {
    const current = find.genre || "";
    const key = normalizeKey(current);
    const mapped = MAPPING[key];
    if (!mapped) continue;
    if (mapped === current) continue;

    await prisma.spotifyFind.update({
      where: { id: find.id },
      data: { genre: mapped },
    });
    updatedCount += 1;
  }

  console.log(`Updated ${updatedCount} records.`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
