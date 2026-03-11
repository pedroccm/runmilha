import { stripe } from "./client";

export async function createCheckoutSession({
  userId,
  planId,
  stripePriceId,
  customerEmail,
}: {
  userId: string;
  planId: string;
  stripePriceId: string;
  customerEmail: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    metadata: { user_id: userId, plan_id: planId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans?canceled=true`,
  });

  return session;
}
