import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { categories as staticCategories } from '@/lib/data/categories';

export const dynamic = 'force-dynamic';

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
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes — categories rarely change

export async function GET() {
    const supabase = getSupabase();
    if (!supabase) {
        return NextResponse.json([], { headers: { 'X-Cache': 'DISABLED' } });
    }

    // Check cache
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
        return NextResponse.json(cache.data, {
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
                'X-Cache': 'HIT'
            }
        });
    }

    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, slug, image_url, parent_id, metadata')
            .eq('status', 'active')
            .order('name');

        if (!error && data) {
            cache = { data, timestamp: Date.now() };
            return NextResponse.json(data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
                    'X-Cache': 'MISS',
                    'X-Data-Source': 'supabase'
                }
            });
        }

        console.error('[Storefront API] Categories error:', error);

        // Fallback 1: Prisma snapshot
        try {
            const prismaCategories = await prisma.category.findMany({
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    supabaseId: true,
                    name: true,
                    slug: true,
                    imageUrl: true,
                },
            });

            const normalized = prismaCategories.map((c) => ({
                id: c.supabaseId ?? c.id,
                name: c.name,
                slug: c.slug,
                image_url: c.imageUrl,
                parent_id: null,
                metadata: null,
            }));

            cache = { data: normalized, timestamp: Date.now() };
            return NextResponse.json(normalized, {
                headers: {
                    'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
                    'X-Cache': 'MISS',
                    'X-Data-Source': 'prisma-fallback'
                }
            });
        } catch (prismaError) {
            console.error('[Storefront API] Prisma category fallback failed:', prismaError);
        }

        // Fallback 2: static seed categories
        const seeded = staticCategories.map((c, idx) => ({
            id: `seed-${idx}`,
            name: c.name,
            slug: c.slug,
            image_url: c.imageUrl ?? null,
            parent_id: null,
            metadata: { description: c.description, accent: c.accent ?? null },
        }));
        return NextResponse.json(seeded, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
                'X-Cache': 'MISS',
                'X-Data-Source': 'static-fallback'
            }
        });
    } catch (err: any) {
        console.error('[Storefront API] Error:', err);
        if (cache?.data) {
            return NextResponse.json(cache.data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=900',
                    'X-Cache': 'STALE',
                    'X-Data-Source': 'cache-fallback'
                }
            });
        }
        const seeded = staticCategories.map((c, idx) => ({
            id: `seed-${idx}`,
            name: c.name,
            slug: c.slug,
            image_url: c.imageUrl ?? null,
            parent_id: null,
            metadata: { description: c.description, accent: c.accent ?? null },
        }));
        return NextResponse.json(seeded, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
                'X-Cache': 'MISS',
                'X-Data-Source': 'static-fallback'
            }
        });
    }
}
