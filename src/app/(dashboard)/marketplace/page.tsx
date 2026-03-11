import { createClient } from "@/lib/supabase/server";
import { formatMilhas } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

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

  const affordable = (rewards || []).filter((r) => balance >= r.cost_milhas);
  const tooExpensive = (rewards || []).filter((r) => balance < r.cost_milhas);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Exchange your milhas for rewards
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-2">
          <p className="text-xs text-muted-foreground">Your Balance</p>
          <p className="font-bold text-primary">
            {formatMilhas(balance)} milhas
          </p>
        </div>
      </div>

      {/* Available to redeem */}
      {affordable.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Available for you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {affordable.map((reward) => (
              <RewardCard key={reward.id} reward={reward} balance={balance} />
            ))}
          </div>
        </div>
      )}

      {/* Not enough milhas */}
      {tooExpensive.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
            Keep training to unlock
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
            {tooExpensive.map((reward) => (
              <RewardCard key={reward.id} reward={reward} balance={balance} />
            ))}
          </div>
        </div>
      )}

      {(!rewards || rewards.length === 0) && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">🏪</p>
          <p className="font-medium">Marketplace coming soon</p>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;re working on exciting rewards from top brands. Stay tuned!
          </p>
        </div>
      )}
    </div>
  );
}

function RewardCard({
  reward,
  balance,
}: {
  reward: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    cost_milhas: number;
    partner_name: string | null;
    remaining_stock: number | null;
  };
  balance: number;
}) {
  const canAfford = balance >= reward.cost_milhas;
  const outOfStock =
    reward.remaining_stock !== null && reward.remaining_stock <= 0;

  return (
    <Link
      href={`/marketplace/${reward.id}`}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group"
    >
      <div className="h-40 bg-muted relative overflow-hidden">
        {reward.image_url ? (
          <Image
            src={reward.image_url}
            alt={reward.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🎁</span>
          </div>
        )}
      </div>
      <div className="p-4">
        {reward.partner_name && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {reward.partner_name}
          </p>
        )}
        <h3 className="font-semibold mt-1">{reward.title}</h3>
        {reward.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {reward.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-primary">
            {formatMilhas(reward.cost_milhas)} milhas
          </span>
          {outOfStock ? (
            <span className="text-xs text-destructive font-medium">
              Out of stock
            </span>
          ) : !canAfford ? (
            <span className="text-xs text-muted-foreground">
              Need {formatMilhas(reward.cost_milhas - balance)} more
            </span>
          ) : (
            <span className="text-xs text-green-500 font-medium">
              Available
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
