import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-10-29.clover" });

// Initialize Supabase client with service role key for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Example static rate. Later, you can fetch live rate via CoinGecko API if desired.
const USDT_RATE = 1.00; // 1 USD = 1 USDT (for MVP simplicity)

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const userId = intent.metadata.userId;
      const amountUsd = intent.amount / 100; // Convert from cents to dollars
      const currency = intent.currency;

      console.log(`Payment succeeded for user ${userId}: $${amountUsd} ${currency.toUpperCase()}`);

      if (!userId) {
        console.error("No userId found in payment intent metadata");
        return NextResponse.json({ error: "Missing userId in metadata" }, { status: 400 });
      }

      // Calculate USDT equivalent
      const usdtEquivalent = amountUsd * USDT_RATE;

      // 1. Create fiat transaction record with USDT conversion
      const { data: transaction, error: transactionError } = await supabase
        .from("fiat_transactions")
        .insert({
          user_id: userId,
          stripe_payment_intent_id: intent.id,
          amount: amountUsd, // Keep original amount for backward compatibility
          amount_usd: amountUsd,
          currency: currency,
          usdt_rate: USDT_RATE,
          status: "completed"
        })
        .select()
        .single();

      if (transactionError) {
        console.error("Failed to create fiat transaction:", transactionError);
        return NextResponse.json({ error: "Failed to create transaction record" }, { status: 500 });
      }

      // 2. Update user's fiat balance in wallets table
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance_fiat, fiat_balance_usd")
        .eq("user_id", userId)
        .single();

      if (walletError && walletError.code !== "PGRST116") { // PGRST116 = no rows found
        console.error("Failed to fetch wallet:", walletError);
        return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
      }

      // Create wallet if it doesn't exist
      if (!wallet) {
        const { error: createWalletError } = await supabase
          .from("wallets")
          .insert({
            user_id: userId,
            balance_fiat: amountUsd,
            fiat_balance_usd: usdtEquivalent,
            balance_tickets: 0
          });

        if (createWalletError) {
          console.error("Failed to create wallet:", createWalletError);
          return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
        }
      } else {
        // Update existing wallet balance (both legacy fiat and new USDT balance)
        const newFiatBalance = (wallet.balance_fiat || 0) + amountUsd;
        const newUsdtBalance = (wallet.fiat_balance_usd || 0) + usdtEquivalent;
        
        const { error: updateError } = await supabase
          .from("wallets")
          .update({ 
            balance_fiat: newFiatBalance,
            fiat_balance_usd: newUsdtBalance,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Failed to update wallet balance:", updateError);
          return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
        }
      }

      console.log(`✅ Successfully processed payment for user ${userId}: +$${amountUsd} USD = ${usdtEquivalent} USDT`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}