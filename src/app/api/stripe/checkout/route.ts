import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: Request) {
  const { userId, email } = await req.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'AI Luxury Network Membership' },
          unit_amount: 9700,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    metadata: { userId },
    success_url: `${appUrl}/dashboard?success=1`,
    cancel_url: `${appUrl}/signup`,
  })

  return NextResponse.json({ url: session.url })
}
