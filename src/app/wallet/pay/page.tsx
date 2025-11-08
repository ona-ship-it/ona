"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await stripe!.confirmPayment({
      elements: elements!,
      confirmParams: { return_url: "http://localhost:3000/wallet" },
    });

    if (error) toast.error(error.message || 'Payment failed');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || loading} className="btn">Pay</button>
    </form>
  );
}

export default function PayPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  async function createPaymentIntent() {
    const res = await fetch("/api/stripe/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 10, currency: "usd", userId: "test-user" }),
    });
    const data = await res.json();
    setClientSecret(data.clientSecret);
  }

  return (
    <div>
      {!clientSecret ? (
        <button onClick={createPaymentIntent}>Start Payment</button>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}