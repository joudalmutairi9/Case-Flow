import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDatabase } from "../src/lib/seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

seedDatabase(prisma)
  .then((credentials) => {
    console.log("Seed complete.");
    console.log("Demo accounts (temporary passwords — change on first login, delete before production):");
    for (const c of credentials) {
      console.log(`  ${c.portal.padEnd(10)} ${c.url.padEnd(20)} ${c.username.padEnd(12)} ${c.password}`);
    }
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
