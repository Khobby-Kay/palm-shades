import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Server-side Supabase client (no auth needed for public data)
function getSupabase(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
        process.env.SUPABASE_SECRET_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) return null;
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

// Simple in-memory cache
let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes — products don't change frequently

export async function GET(request: Request) {
    const supabase = getSupabase();
    if (!supabase) {
        return NextResponse.json([], { headers: { 'X-Cache': 'DISABLED' } });
    }

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');

    // Build a cache key from params
    const cacheKey = `${featured}-${limit}-${category || 'all'}`;

    // Check cache (only for featured/home requests — general shop is more dynamic)
    if (featured && cache && cache.data?.[cacheKey] && Date.now() - cache.timestamp < CACHE_TTL) {
        return NextResponse.json(cache.data[cacheKey], {
            headers: {
                'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
                'X-Cache': 'HIT'
            }
        });
    }

    try {
        const joinedQuery = supabase
            .from('products')
            .select(`
                id, name, slug, price, compare_at_price, quantity, description, metadata, category_id,
                categories(id, name, slug),
                product_images(url, position),
                product_variants(id, name, price, quantity)
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(limit);

        const { data, error } = await joinedQuery;

        if (!error && data) {
            if (!cache) cache = { data: {}, timestamp: Date.now() };
            cache.data[cacheKey] = data;
            cache.timestamp = Date.now();
            return NextResponse.json(data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
                    'X-Cache': 'MISS',
                    'X-Data-Source': 'supabase-joined'
                }
            });
        }

        console.error('[Storefront API] Joined query failed:', error);

        // Fallback 1: simpler Supabase reads (avoids nested join issues)
        try {
            let categoryId: string | null = null;
            if (category) {
                const { data: catRow } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('slug', category)
                    .maybeSingle();
                categoryId = catRow?.id ?? null;
                if (!categoryId) {
                    return NextResponse.json([], {
                        headers: {
                            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
                            'X-Cache': 'MISS',
                            'X-Data-Source': 'supabase-simple-empty'
                        }
                    });
                }
            }

            let simpleProductsQuery = supabase
                .from('products')
                .select('id, name, slug, price, compare_at_price, quantity, description, metadata, category_id, featured, status')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (featured) simpleProductsQuery = simpleProductsQuery.eq('featured', true);
            if (categoryId) simpleProductsQuery = simpleProductsQuery.eq('category_id', categoryId);

            const { data: simpleProducts, error: simpleErr } = await simpleProductsQuery;
            if (simpleErr) throw simpleErr;

            const ids = (simpleProducts ?? []).map((p: any) => p.id);
            const categoryIds = [...new Set((simpleProducts ?? []).map((p: any) => p.category_id).filter(Boolean))];

            const [{ data: categoriesData }, { data: imagesData }, { data: variantsData }] = await Promise.all([
                categoryIds.length > 0
                    ? supabase.from('categories').select('id, name, slug').in('id', categoryIds as string[])
                    : Promise.resolve({ data: [] as any[] }),
                ids.length > 0
                    ? supabase.from('product_images').select('product_id, url, position').in('product_id', ids).order('position', { ascending: true })
                    : Promise.resolve({ data: [] as any[] }),
                ids.length > 0
                    ? supabase.from('product_variants').select('id, product_id, name, price, quantity').in('product_id', ids)
                    : Promise.resolve({ data: [] as any[] }),
            ]);

            const categoryMap = new Map((categoriesData ?? []).map((c: any) => [c.id, c]));
            const imageMap = new Map<string, any[]>();
            for (const row of imagesData ?? []) {
                const arr = imageMap.get(row.product_id) ?? [];
                arr.push({ url: row.url, position: row.position });
                imageMap.set(row.product_id, arr);
            }
            const variantMap = new Map<string, any[]>();
            for (const row of variantsData ?? []) {
                const arr = variantMap.get(row.product_id) ?? [];
                arr.push({ id: row.id, name: row.name, price: row.price, quantity: row.quantity });
                variantMap.set(row.product_id, arr);
            }

            const normalized = (simpleProducts ?? []).map((p: any) => ({
                ...p,
                categories: p.category_id ? categoryMap.get(p.category_id) ?? null : null,
                product_images: imageMap.get(p.id) ?? [],
                product_variants: variantMap.get(p.id) ?? [],
            }));

            if (!cache) cache = { data: {}, timestamp: Date.now() };
            cache.data[cacheKey] = normalized;
            cache.timestamp = Date.now();

            return NextResponse.json(normalized, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
                    'X-Cache': 'MISS',
                    'X-Data-Source': 'supabase-simple'
                }
            });
        } catch (simpleFallbackError) {
            console.error('[Storefront API] Simple Supabase fallback failed:', simpleFallbackError);
        }

        // Fallback 2: Prisma read path (sync snapshot)
        try {
            const prismaProducts = await prisma.product.findMany({
                where: {
                    isActive: true,
                    ...(featured ? { isFeatured: true } : {}),
                    ...(category ? { category: { slug: category } } : {}),
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: {
                    category: true,
                    images: { orderBy: { position: 'asc' } },
                    variants: { where: { isActive: true } },
                },
            });

            const prismaNormalized = prismaProducts.map((p) => ({
                id: p.supabaseId ?? p.id,
                name: p.name,
                slug: p.slug,
                price: p.price / 100,
                compare_at_price: p.compareAtPrice != null ? p.compareAtPrice / 100 : null,
                quantity: p.stock,
                description: p.description,
                metadata: null,
                category_id: p.category?.supabaseId ?? p.categoryId,
                categories: p.category
                    ? {
                        id: p.category.supabaseId ?? p.category.id,
                        name: p.category.name,
                        slug: p.category.slug,
                    }
                    : null,
                product_images: p.images.map((img) => ({
                    url: img.url,
                    position: img.position,
                })),
                product_variants: p.variants.map((v) => ({
                    id: v.supabaseId ?? v.id,
                    name: v.name,
                    price: v.price != null ? v.price / 100 : null,
                    quantity: v.stock,
                })),
            }));

        if (!cache) cache = { data: {}, timestamp: Date.now() };
            cache.data[cacheKey] = prismaNormalized;
        cache.timestamp = Date.now();

            return NextResponse.json(prismaNormalized, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
                    'X-Cache': 'MISS',
                    'X-Data-Source': 'prisma-fallback'
                }
            });
        } catch (prismaFallbackError) {
            console.error('[Storefront API] Prisma fallback failed:', prismaFallbackError);
        }

        // Final fail-safe: stale cache or empty list.
        const stale = cache?.data?.[cacheKey];
        if (stale) {
            return NextResponse.json(stale, {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=900',
                    'X-Cache': 'STALE',
                    'X-Data-Source': 'cache-fallback'
                }
            });
        }

        return NextResponse.json([], {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
                'X-Cache': 'MISS',
                'X-Data-Source': 'empty-fallback'
            }
        });
    } catch (err: any) {
        console.error('[Storefront API] Error:', err);
        const stale = cache?.data?.[cacheKey];
        if (stale) {
            return NextResponse.json(stale, {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=900',
                    'X-Cache': 'STALE',
                    'X-Data-Source': 'cache-fallback'
                }
            });
        }
        return NextResponse.json([], {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
                'X-Cache': 'MISS',
                'X-Data-Source': 'empty-fallback'
            }
        });
    }
}
