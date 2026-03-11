"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMilhas } from "@/lib/utils";
import type { User, Plan } from "@/types/database";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [milhasAmount, setMilhasAmount] = useState("");
  const [milhasReason, setMilhasReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUser();
    loadPlans();
  }, [id]);

  async function loadUser() {
    const { data } = await supabase
      .from("rm_users")
      .select("*, plan:rm_plans(*), wallet:rm_wallets(*)")
      .eq("id", id)
      .single();
    setUser(data);
  }

  async function loadPlans() {
    const { data } = await supabase
      .from("rm_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_cents");
    setPlans(data || []);
  }

  async function changePlan(planId: string) {
    setLoading(true);
    await supabase
      .from("rm_users")
      .update({ plan_id: planId, updated_at: new Date().toISOString() })
      .eq("id", id);
    setMessage("Plan updated");
    await loadUser();
    setLoading(false);
  }

  async function toggleAdmin() {
    if (!user) return;
    setLoading(true);
    await supabase
      .from("rm_users")
      .update({ is_admin: !user.is_admin, updated_at: new Date().toISOString() })
      .eq("id", id);
    setMessage(user.is_admin ? "Admin removed" : "Admin granted");
    await loadUser();
    setLoading(false);
  }

  async function addMilhas(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.wallet) return;
    setLoading(true);

    const amount = parseFloat(milhasAmount);
    if (isNaN(amount) || amount === 0) {
      setMessage("Invalid amount");
      setLoading(false);
      return;
    }

    const wallet = user.wallet;
    const newBalance = wallet.balance + amount;

    await supabase
      .from("rm_wallets")
      .update({
        balance: newBalance,
        total_earned: amount > 0 ? wallet.total_earned + amount : wallet.total_earned,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", id);

    await supabase.from("rm_transactions").insert({
      user_id: id,
      wallet_id: wallet.id,
      type: amount > 0 ? "adjustment" : "adjustment",
      amount,
      balance_after: newBalance,
      description: milhasReason || `Admin adjustment: ${amount > 0 ? "+" : ""}${amount} milhas`,
      reference_type: "admin",
    });

    setMilhasAmount("");
    setMilhasReason("");
    setMessage(`${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount)} milhas`);
    await loadUser();
    setLoading(false);
  }

  if (!user) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold">{user.full_name || "Unnamed User"}</h1>
        {user.is_admin && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Admin</span>
        )}
      </div>

      {message && (
        <div className="bg-green-500/10 text-green-500 text-sm px-4 py-2 rounded-lg">
          {message}
        </div>
      )}

      {/* Info */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Profile</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">ID</p>
            <p className="font-mono">{user.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Joined</p>
            <p>{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Subscription</p>
            <p>{user.subscription_status}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stripe Customer</p>
            <p className="font-mono text-xs">{user.stripe_customer_id || "—"}</p>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold">Wallet</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-xl font-bold text-accent">{formatMilhas(user.wallet?.balance ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Earned</p>
            <p className="text-xl font-bold">{formatMilhas(user.wallet?.total_earned ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-xl font-bold">{formatMilhas(user.wallet?.total_spent ?? 0)}</p>
          </div>
        </div>

        <form onSubmit={addMilhas} className="flex gap-2 items-end pt-2 border-t border-border">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Amount (negative to deduct)</label>
            <input
              type="number"
              step="0.1"
              value={milhasAmount}
              onChange={(e) => setMilhasAmount(e.target.value)}
              placeholder="50"
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm mt-1"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Reason</label>
            <input
              value={milhasReason}
              onChange={(e) => setMilhasReason(e.target.value)}
              placeholder="Bonus, correction..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm mt-1"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>

      {/* Plan */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Plan: {user.plan?.name ?? "Free"} ({user.plan?.conversion_rate ?? 0.5}x)</h2>
        <div className="flex gap-2 flex-wrap">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => changePlan(p.id)}
              disabled={loading || p.id === user.plan_id}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                p.id === user.plan_id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-muted disabled:opacity-50"
              }`}
            >
              {p.name} ({p.conversion_rate}x)
            </button>
          ))}
        </div>
      </div>

      {/* Admin Toggle */}
      <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Admin Access</h2>
          <p className="text-xs text-muted-foreground">Allow this user to access the CMS</p>
        </div>
        <button
          onClick={toggleAdmin}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-medium ${
            user.is_admin
              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
              : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
          }`}
        >
          {user.is_admin ? "Revoke Admin" : "Grant Admin"}
        </button>
      </div>
    </div>
  );
}
