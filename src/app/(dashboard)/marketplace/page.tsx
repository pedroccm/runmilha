import { createClient } from "@/lib/supabase/server";
import { formatMilhas } from "@/lib/utils";
import { RewardGrid } from "@/components/marketplace/reward-grid";

export default async function MarketplacePage() {
  const supabase = await createClient();

  const { data: rewards } = await supabase
    .from("rm_rewards")
    .select("*")
    .eq("is_active", true)
    .order("cost_milhas", { ascending: true });

  const { data: { user } } = await supabase.auth.getUser();
  const { data: wallet } = await supabase
    .from("rm_wallets")
    .select("balance")
    .eq("user_id", user?.id)
    .single();

  const balance = wallet?.balance ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Exchange your PaceCoin for rewards
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-2">
          <p className="text-xs text-muted-foreground">Your Balance</p>
          <p className="font-bold text-primary">
            {formatMilhas(balance)} PaceCoin
          </p>
        </div>
      </div>

      <RewardGrid rewards={rewards || []} balance={balance} />
    </div>
  );
}
