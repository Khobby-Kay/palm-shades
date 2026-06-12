import { NextResponse } from 'next/server';
import { fetchSupabaseOrderByRef } from '@/lib/tiwa/fetch-order';
import { initiateMoolrePayment } from '@/lib/tiwa/moolre-payment';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/tiwa/rate-limit';

export async function POST(req: Request) {
    try {
        const clientId = getClientIdentifier(req);
        const rateLimitResult = checkRateLimit(`payment:${clientId}`, RATE_LIMITS.payment);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, message: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimitResult.resetIn.toString()
                    }
                }
            );
        }

        const body = await req.json();
        const { orderId, customerEmail } = body;

        if (!orderId || typeof orderId !== 'string') {
            return NextResponse.json({ success: false, message: 'Missing or invalid orderId' }, { status: 400 });
        }

        const { data: order, error: orderError } = await fetchSupabaseOrderByRef(
            orderId.trim(),
            'id, order_number, total, email, payment_status'
        );

        if (orderError) {
            console.error('[Payment] Lookup error:', orderId, orderError.message);
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        if (!order) {
            console.error('[Payment] Order not found:', orderId);
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        const requestUrl = new URL(req.url);
        const result = await initiateMoolrePayment(
            {
                orderNumber: order.order_number || orderId,
                total: Number(order.total),
                email: order.email,
                customerEmail,
                paymentStatus: order.payment_status,
            },
            requestUrl.origin
        );

        if (!result.success) {
            const status = result.message === 'Order is already paid' ? 400 : 400;
            return NextResponse.json({ success: false, message: result.message }, { status });
        }

        return NextResponse.json({
            success: true,
            url: result.url,
            reference: result.reference,
        });

    } catch (error: unknown) {
        console.error('Payment API Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        if (message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
            return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
