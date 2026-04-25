import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { email, userId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: 'AI Luxury Membership' },
        unit_amount: 9700, // $97.00
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }],
    metadata: { userId },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/signup`,
  })

  return NextResponse.json({ url: session.url })
}
