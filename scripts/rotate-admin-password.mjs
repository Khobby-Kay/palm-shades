import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const envFile = process.argv.includes("--vercel-pull")
  ? ".env.vercel.tmp"
  : ".env";

function loadEnv(path) {
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i);
    let v = t.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv(envFile);

const ADMIN_EMAIL = "admin@motchisbeauty.com";

function generatePassword() {
  const base = randomBytes(12).toString("base64url");
  return `MOTCHIS-${base}!`;
}

const password = generatePassword();
const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!user) {
    console.error(`Admin user ${ADMIN_EMAIL} not found. Run db:seed first.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: { passwordHash, role: "ADMIN" },
  });

  console.log(JSON.stringify({
    email: ADMIN_EMAIL,
    password,
    signInUrl: "/admin-signin",
    note: "Save this password now — it will not be shown again.",
  }, null, 2));
} finally {
  await prisma.$disconnect();
}
