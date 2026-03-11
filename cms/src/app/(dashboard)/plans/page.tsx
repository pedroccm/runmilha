import { createAdminClient } from "@/lib/supabase/admin";
import { formatMilhas, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const supabase = createAdminClient();

  const { data: plans } = await supabase
    .from("rm_plans")
    .select("*")
    .order("price_cents");

  // Count users per plan
  const { data: users } = await supabase
    .from("rm_users")
    .select("plan_id");

  const planCounts: Record<string, number> = {};
  users?.forEach((u) => {
    const key = u.plan_id || "none";
    planCounts[key] = (planCounts[key] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans?.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{p.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                p.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
              }`}>
                {p.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <p className="text-2xl font-bold">
                {p.price_cents === 0 ? "Free" : formatCurrency(p.price_cents)}
              </p>
              {p.price_cents > 0 && <p className="text-xs text-muted-foreground">/month</p>}
            </div>

            <div className="py-2 px-3 rounded-lg bg-muted text-center">
              <span className="text-lg font-bold text-accent">{p.conversion_rate}x</span>
              <p className="text-xs text-muted-foreground">milhas/km</p>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Users</span>
              <span className="font-medium">{planCounts[p.id] || 0}</span>
            </div>

            {p.monthly_cap && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Cap</span>
                <span className="font-medium">{formatMilhas(p.monthly_cap)}</span>
              </div>
            )}

            {p.stripe_price_id && (
              <p className="text-xs text-muted-foreground font-mono truncate">
                Stripe: {p.stripe_price_id}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
