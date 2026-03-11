import { createClient } from "@/lib/supabase/server";
import { formatMilhas } from "@/lib/utils";
import { notFound } from "next/navigation";
import { RedeemButton } from "@/components/marketplace/redeem-button";

export default async function RewardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: reward } = await supabase
    .from("rm_rewards")
    .select("*")
    .eq("id", id)
    .single();

  if (!reward) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: wallet } = await supabase
    .from("rm_wallets")
    .select("balance")
    .eq("user_id", user?.id)
    .single();

  const balance = wallet?.balance ?? 0;
  const canAfford = balance >= reward.cost_milhas;
  const outOfStock =
    reward.remaining_stock !== null && reward.remaining_stock <= 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {reward.image_url ? (
        <div className="h-60 bg-muted rounded-xl overflow-hidden">
          <img
            src={reward.image_url}
            alt={reward.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-60 bg-muted rounded-xl flex items-center justify-center">
          <span className="text-6xl">🎁</span>
        </div>
      )}

      <div>
        {reward.partner_name && (
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            {reward.partner_name}
          </p>
        )}
        <h1 className="text-2xl font-bold mt-1">{reward.title}</h1>
        {reward.description && (
          <p className="text-muted-foreground mt-2">{reward.description}</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cost</p>
            <p className="text-3xl font-bold text-primary">
              {formatMilhas(reward.cost_milhas)} milhas
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Your Balance</p>
            <p className="text-xl font-bold">{formatMilhas(balance)} milhas</p>
          </div>
        </div>

        <div className="mt-6">
          {outOfStock ? (
            <button
              disabled
              className="w-full py-3 rounded-lg bg-muted text-muted-foreground font-medium"
            >
              Out of Stock
            </button>
          ) : !canAfford ? (
            <button
              disabled
              className="w-full py-3 rounded-lg bg-muted text-muted-foreground font-medium"
            >
              Not enough milhas (need{" "}
              {formatMilhas(reward.cost_milhas - balance)} more)
            </button>
          ) : (
            <RedeemButton rewardId={reward.id} cost={reward.cost_milhas} />
          )}
        </div>

        {reward.valid_until && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Valid until{" "}
            {new Date(reward.valid_until).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
