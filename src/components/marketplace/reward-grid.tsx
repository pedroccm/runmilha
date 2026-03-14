"use client";

import { useState } from "react";
import { formatMilhas } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type Reward = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cost_milhas: number;
  partner_name: string | null;
  remaining_stock: number | null;
};

export function RewardGrid({
  rewards,
  balance,
}: {
  rewards: Reward[];
  balance: number;
}) {
  const [showOnlyAffordable, setShowOnlyAffordable] = useState(false);

  const roundedBalance = Math.round(balance * 100) / 100;
  const affordable = rewards.filter((r) => roundedBalance >= r.cost_milhas);
  const tooExpensive = rewards.filter((r) => roundedBalance < r.cost_milhas);

  return (
    <>
      {/* Filter toggle */}
      {affordable.length > 0 && tooExpensive.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOnlyAffordable(!showOnlyAffordable)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showOnlyAffordable
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Only what I can redeem
          </button>
          {showOnlyAffordable && (
            <span className="text-xs text-muted-foreground">
              Showing {affordable.length} of {rewards.length} rewards
            </span>
          )}
        </div>
      )}

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

      {/* Not enough PaceCoin */}
      {!showOnlyAffordable && tooExpensive.length > 0 && (
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

      {rewards.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">🏪</p>
          <p className="font-medium">Marketplace coming soon</p>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;re working on exciting rewards from top brands. Stay tuned!
          </p>
        </div>
      )}
    </>
  );
}

function RewardCard({
  reward,
  balance,
}: {
  reward: Reward;
  balance: number;
}) {
  const canAfford = Math.round(balance * 100) / 100 >= reward.cost_milhas;
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
            {formatMilhas(reward.cost_milhas)} PaceCoin
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
