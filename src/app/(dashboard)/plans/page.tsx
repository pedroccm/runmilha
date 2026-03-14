import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/constants";

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("rm_users")
    .select("*, plan:rm_plans(*)")
    .eq("id", user?.id)
    .single();

  const currentPlan = profile?.plan?.slug ?? "free";
  const plans = Object.values(PLANS);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Plans</h1>
        <p className="text-muted-foreground mt-1">
          Upgrade to earn more PaceCoin per kilometer
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.slug === currentPlan;
          const isPopular = "popular" in plan && plan.popular;

          return (
            <div
              key={plan.slug}
              className={`relative bg-card border rounded-2xl p-6 flex flex-col ${
                isCurrent
                  ? "border-primary ring-2 ring-primary/20"
                  : isPopular
                    ? "border-primary/50"
                    : "border-border"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  CURRENT PLAN
                </div>
              )}
              {!isCurrent && isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {plan.priceCents === 0
                    ? "Free"
                    : `R$${(plan.priceCents / 100).toFixed(2).replace(".", ",")}`}
                </span>
                {plan.priceCents > 0 && (
                  <span className="text-muted-foreground text-sm">/month</span>
                )}
              </div>

              <div className="mt-4 py-3 px-4 rounded-lg bg-muted text-center">
                <span className="text-2xl font-bold text-primary">
                  {plan.conversionRate}x
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  PaceCoin per km
                </p>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                className={`mt-6 w-full py-2.5 rounded-lg font-medium transition-colors ${
                  isCurrent
                    ? "bg-muted text-muted-foreground cursor-default"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isCurrent ? "Current Plan" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Stripe integration coming soon. Contact us to upgrade manually during
        beta.
      </p>
    </div>
  );
}
