import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// tsx does not load .env by itself: minimal loader (existing shell
// env always wins, file values only fill the gaps).
function loadDotEnv(): void {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const key = trimmed.slice(0, trimmed.indexOf("=")).trim();
    if (process.env[key] !== undefined) continue;
    const raw = trimmed.slice(trimmed.indexOf("=") + 1).trim();
    process.env[key] =
      raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  }
}

loadDotEnv();

const prisma = new PrismaClient();



async function main(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set (in .env or the shell). Refusing to seed.",
    );
  }

  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "Admin", passwordHash: adminHash, role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  console.log(`Seed OK: admin (${adminEmail}).`);
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
