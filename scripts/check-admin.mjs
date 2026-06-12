import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({
    where: { email: "admin@motchisbeauty.com" },
    select: { email: true, role: true, passwordHash: true },
  });
  console.log(user ? { email: user.email, role: user.role, hasPassword: !!user.passwordHash } : "NOT FOUND");
} catch (e) {
  console.error("DB ERROR:", e.message);
} finally {
  await prisma.$disconnect();
}
