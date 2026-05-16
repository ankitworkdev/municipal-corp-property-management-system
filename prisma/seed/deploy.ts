/**
 * Production deploy seed — idempotent full demo data (safe to run on every deploy).
 */
import { execSync } from "node:child_process";

console.log("Running full demo seed...");
execSync("npx tsx prisma/seed/full-demo.ts", { stdio: "inherit", env: process.env });
console.log("Deploy seed complete.");
