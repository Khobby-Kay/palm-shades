/**
 * One-off: push storefront (Prisma) products that are NOT yet linked to Supabase
 * up into the Supabase admin catalog, so the admin manages every product.
 * After running this, run `npm run sync:catalog` to link them back (sets supabaseId).
 *
 * Safe to run repeatedly — upserts Supabase products by slug.
 */
import { loadEnvLocal } from './load-env-local.mjs';
const e = loadEnvLocal();
Object.assign(process.env, e);

const { createClient } = await import('@supabase/supabase-js');
const { PrismaClient } = await import('@prisma/client');

const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const prisma = new PrismaClient();

const minorToMajor = (m) => (Number(m) || 0) / 100;

async function ensureCategory(slug, name) {
  if (!slug) return null;
  const found = await sb.from('categories').select('id').eq('slug', slug).maybeSingle();
  if (found.data?.id) return found.data.id;
  const created = await sb
    .from('categories')
    .insert([{ name: name || slug, slug, status: 'active' }])
    .select('id')
    .single();
  if (created.error) {
    console.warn('  ! category create failed for', slug, created.error.message);
    return null;
  }
  return created.data.id;
}

async function upsertProduct(p) {
  const categorySlug = p.category?.slug ?? null;
  const categoryName = p.category?.name ?? null;
  const categoryId = categorySlug ? await ensureCategory(categorySlug, categoryName) : null;

  const baseRow = {
    name: p.name,
    slug: p.slug,
    description: p.description ?? null,
    short_description: p.shortDesc ?? null,
    price: minorToMajor(p.price),
    compare_at_price: p.compareAtPrice != null ? minorToMajor(p.compareAtPrice) : null,
    quantity: p.stock ?? 0,
    status: p.isActive ? 'active' : 'draft',
    featured: !!p.isFeatured,
    category_id: categoryId,
    rating_avg: Number(p.rating ?? 0),
    review_count: Number(p.reviewCount ?? 0),
    metadata: { is_new: !!p.isNew, is_bestseller: !!p.isBestSeller },
  };

  // Try with sku = productCode; on unique conflict, retry without sku.
  let row = { ...baseRow, sku: p.productCode || null };
  let res = await sb.from('products').upsert(row, { onConflict: 'slug' }).select('id').single();
  if (res.error && /sku/i.test(res.error.message)) {
    row = { ...baseRow };
    res = await sb.from('products').upsert(row, { onConflict: 'slug' }).select('id').single();
  }
  if (res.error) throw new Error(res.error.message);
  const productId = res.data.id;

  // Replace images
  await sb.from('product_images').delete().eq('product_id', productId);
  if (p.images?.length) {
    const imageRows = p.images
      .sort((a, b) => a.position - b.position)
      .map((img, i) => ({
        product_id: productId,
        url: img.url,
        alt_text: img.alt ?? p.name,
        position: img.position ?? i,
      }));
    const imgRes = await sb.from('product_images').insert(imageRows);
    if (imgRes.error) console.warn('  ! images failed:', imgRes.error.message);
  }

  // Replace variants
  await sb.from('product_variants').delete().eq('product_id', productId);
  if (p.variants?.length) {
    const variantRows = p.variants.map((v) => ({
      product_id: productId,
      name: v.name,
      sku: v.sku || null,
      price: minorToMajor(v.price ?? p.price),
      compare_at_price: v.compareAtPrice != null ? minorToMajor(v.compareAtPrice) : null,
      quantity: v.stock ?? 0,
      image_url: v.imageUrl ?? null,
      option1: v.name,
    }));
    const varRes = await sb.from('product_variants').insert(variantRows);
    if (varRes.error) console.warn('  ! variants failed:', varRes.error.message);
  }

  return productId;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { supabaseId: null },
    include: {
      category: { select: { slug: true, name: true } },
      images: true,
      variants: { where: { isActive: true } },
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Found ${products.length} unlinked storefront product(s) to import into admin.`);

  let ok = 0;
  const failed = [];
  for (const p of products) {
    try {
      const id = await upsertProduct(p);
      ok += 1;
      console.log(`  ✓ ${p.name}  → supabase ${id}`);
    } catch (err) {
      failed.push(p.name);
      console.warn(`  ✗ ${p.name}: ${err.message}`);
    }
  }

  console.log(`\nImported ${ok}/${products.length}. ${failed.length ? 'Failed: ' + failed.join(', ') : ''}`);
  await prisma.$disconnect();
  process.exit(failed.length ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
