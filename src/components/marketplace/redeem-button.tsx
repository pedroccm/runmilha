"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setPromoCode(data.promoCode);
      router.refresh();
    } catch {
      setError("Something went wrong");
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
