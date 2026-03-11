"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMilhas } from "@/lib/utils";

export function RedeemButton({
  rewardId,
  cost,
}: {
  rewardId: string;
  cost: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRedeem() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch wallet
      const { data: wallet } = await supabase
        .from("rm_wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!wallet || wallet.balance < cost) {
        setError("Not enough milhas");
        setLoading(false);
        return;
      }

      // Fetch reward for stock check and promo code generation
      const { data: reward } = await supabase
        .from("rm_rewards")
        .select("*")
        .eq("id", rewardId)
        .single();

      if (!reward) throw new Error("Reward not found");
      if (reward.remaining_stock !== null && reward.remaining_stock <= 0) {
        setError("Out of stock");
        setLoading(false);
        return;
      }

      // Generate promo code
      const code = `${reward.promo_code_prefix || "RM"}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      const newBalance = wallet.balance - cost;

      // Deduct from wallet
      await supabase
        .from("rm_wallets")
        .update({
          balance: newBalance,
          total_spent: wallet.total_spent + cost,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      // Create transaction
      const { data: transaction } = await supabase
        .from("rm_transactions")
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          type: "spend",
          amount: -cost,
          balance_after: newBalance,
          description: `Redeemed: ${reward.title}`,
          reference_type: "redemption",
        })
        .select()
        .single();

      // Create redemption
      await supabase.from("rm_redemptions").insert({
        user_id: user.id,
        reward_id: rewardId,
        transaction_id: transaction?.id,
        promo_code: code,
        status: "active",
        expires_at: reward.valid_until,
      });

      // Decrease stock
      if (reward.remaining_stock !== null) {
        await supabase
          .from("rm_rewards")
          .update({ remaining_stock: reward.remaining_stock - 1 })
          .eq("id", rewardId);
      }

      setPromoCode(code);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (promoCode) {
    return (
      <div className="text-center space-y-3">
        <p className="text-green-500 font-medium">Redeemed successfully!</p>
        <div className="bg-muted rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Your promo code</p>
          <p className="text-2xl font-mono font-bold tracking-wider">
            {promoCode}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Save this code. You can also find it in Settings &gt; My Rewards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg text-center">
          {error}
        </p>
      )}
      <button
        onClick={handleRedeem}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
          confirming
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {loading
          ? "Processing..."
          : confirming
            ? `Confirm — Spend ${formatMilhas(cost)} milhas`
            : "Redeem Reward"}
      </button>
      {confirming && !loading && (
        <button
          onClick={() => setConfirming(false)}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
