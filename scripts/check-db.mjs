import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const [products, users, orders] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count(),
  ]);
  console.log(
    JSON.stringify({
      ok: true,
      host: process.env.DATABASE_URL?.includes("supabase") ? "supabase" : "unknown",
      products,
      users,
      orders,
    })
  );
} catch (e) {
  console.error(JSON.stringify({ ok: false, error: e.message }));
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
