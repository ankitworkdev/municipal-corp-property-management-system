import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const { hash } = bcrypt;

const prisma = new PrismaClient();

async function main() {
  const pw = await hash("Citizen@123", 12);

  // Update all citizen users to have a password
  const result = await prisma.user.updateMany({
    where: { role: "USER", passwordHash: null },
    data: { passwordHash: pw },
  });

  console.log(`Updated ${result.count} citizen users with password: Citizen@123`);

  // Show some sample citizens for testing
  const citizens = await prisma.user.findMany({ where: { role: "USER" }, take: 5, select: { firstName: true, lastName: true, mobile: true } });
  console.log("\nSample citizen logins (mobile / Citizen@123):");
  citizens.forEach(c => console.log(`  ${c.mobile} - ${c.firstName} ${c.lastName}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
