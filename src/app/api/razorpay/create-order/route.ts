import { razorpay } from '@/lib/razorpay';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { price } = await request.json();

    if (!price?.unitAmount || price.unitAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid price amount' },
        { status: 400 }
      );
    }

    const currency = price.currency || 'INR';

    const order = await razorpay.orders.create({
      amount: Math.round(price.unitAmount),
      currency: currency.toUpperCase(),
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user.id,
        priceId: price.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);

    return NextResponse.json(
      { error: 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}