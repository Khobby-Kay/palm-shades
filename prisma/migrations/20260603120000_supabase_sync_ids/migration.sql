-- Link Prisma rows to Tiwa/Supabase uuids for catalog + order sync
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "supabaseId" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "supabaseId" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "supabaseId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "supabaseId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Category_supabaseId_key" ON "Category"("supabaseId");
CREATE UNIQUE INDEX IF NOT EXISTS "Product_supabaseId_key" ON "Product"("supabaseId");
CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_supabaseId_key" ON "ProductVariant"("supabaseId");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_supabaseId_key" ON "Order"("supabaseId");
