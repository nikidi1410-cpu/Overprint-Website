import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" }),
});

const seed = [
  { line: "Misregistration is a feature if you say it confidently.", signedBy: "Laras", ink: "pink", copies: 14 },
  { line: "Our band has eleven fans and they all need a poster.", signedBy: "Kopi Tubruk Club", ink: "red", copies: 11 },
  { line: "Print the recipe, not the photo of the recipe.", signedBy: null, ink: "teal", copies: 6 },
  { line: "Yellow is the hardest ink to see and the easiest to love.", signedBy: "Dimas", ink: "yellow", copies: 9 },
  { line: "Zine #4 is late because the cat sat on zine #3.", signedBy: "Rara", ink: "blue", copies: 21 },
  { line: "Two colours is a palette. Three is a budget conversation.", signedBy: null, ink: "pink", copies: 5 },
  { line: "Smell of soy ink on a Tuesday morning.", signedBy: "Fajar", ink: "teal", copies: 8 },
  { line: "Hand-trimmed, slightly crooked, entirely ours.", signedBy: "Nadia", ink: "blue", copies: 12 },
] as const;

async function main() {
  await prisma.print.deleteMany();
  const now = Date.now();
  for (const [i, p] of seed.entries()) {
    await prisma.print.create({
      // Spread the seed over the past few days so the feed reads like history.
      data: { ...p, createdAt: new Date(now - (seed.length - i) * 1000 * 60 * 60 * 7) },
    });
  }
  console.log(`Seeded ${seed.length} prints.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
