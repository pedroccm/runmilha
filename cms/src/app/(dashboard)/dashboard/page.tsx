import { createAdminClient } from "@/lib/supabase/admin";
import { formatMilhas } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const [
    { count: usersCount },
    { count: activitiesCount },
    { count: redemptionsCount },
    { count: rewardsCount },
    { data: wallets },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("rm_users").select("*", { count: "exact", head: true }),
    supabase.from("rm_activities").select("*", { count: "exact", head: true }),
    supabase.from("rm_redemptions").select("*", { count: "exact", head: true }),
    supabase.from("rm_rewards").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("rm_wallets").select("balance, total_earned, total_spent"),
    supabase.from("rm_users").select("id, full_name, created_at, plan:rm_plans(name)").order("created_at", { ascending: false }).limit(5),
  ]);

  const totalBalance = (wallets || []).reduce((s, w) => s + w.balance, 0);
  const totalEarned = (wallets || []).reduce((s, w) => s + w.total_earned, 0);
  const totalSpent = (wallets || []).reduce((s, w) => s + w.total_spent, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={usersCount ?? 0} />
        <StatCard label="Activities Synced" value={activitiesCount ?? 0} />
        <StatCard label="Active Rewards" value={rewardsCount ?? 0} />
        <StatCard label="Redemptions" value={redemptionsCount ?? 0} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Milhas in Circulation</p>
          <p className="text-2xl font-bold text-accent mt-1">{formatMilhas(totalBalance)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Distributed</p>
          <p className="text-2xl font-bold mt-1">{formatMilhas(totalEarned)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Redeemed</p>
          <p className="text-2xl font-bold mt-1">{formatMilhas(totalSpent)}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Users</h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {recentUsers?.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{u.full_name || "No name"}</p>
                <p className="text-xs text-muted-foreground">{u.id.slice(0, 8)}...</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{u.plan?.name ?? "Free"}</p>
                <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {(!recentUsers || recentUsers.length === 0) && (
            <p className="p-6 text-center text-sm text-muted-foreground">No users yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
