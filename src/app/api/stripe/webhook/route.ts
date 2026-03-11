import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const planId = session.metadata?.plan_id;

      if (userId && planId) {
        await supabase
          .from("rm_users")
          .update({
            plan_id: planId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: user } = await supabase
        .from("rm_users")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      if (user) {
        await supabase
          .from("rm_users")
          .update({
            subscription_status: subscription.status === "active" ? "active" : "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // Find the free plan
      const { data: freePlan } = await supabase
        .from("rm_plans")
        .select("id")
        .eq("slug", "free")
        .single();

      await supabase
        .from("rm_users")
        .update({
          plan_id: freePlan?.id,
          subscription_status: "canceled",
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
