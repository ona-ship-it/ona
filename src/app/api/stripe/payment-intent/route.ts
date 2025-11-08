import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Initialize Stripe client; use account default API version
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const { amount, currency, userId } = await req.json();

    // Optional: check user balance or limits from your DB
    if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: currency || "usd",
      metadata: { userId },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}