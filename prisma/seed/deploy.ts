/**
 * Idempotent production seed: runs base + demo data only when the DB is empty.
 */
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  if (users > 0) {
    console.log(`Database already has ${users} user(s); skipping seed.`);
    return;
  }

  console.log("Empty database — running full seed...");
  const run = (script: string) => {
    execSync(`npx tsx ${script}`, { stdio: "inherit", env: process.env });
  };
  run("prisma/seed/seed.ts");
  run("prisma/seed/demo-data.ts");
  run("prisma/seed/add-citizen-passwords.ts");
  console.log("Production seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
