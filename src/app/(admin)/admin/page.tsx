import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const supabase = createAdminClient();

  const { count: usersCount } = await supabase
    .from("rm_users")
    .select("*", { count: "exact", head: true });

  const { count: activitiesCount } = await supabase
    .from("rm_activities")
    .select("*", { count: "exact", head: true });

  const { count: redemptionsCount } = await supabase
    .from("rm_redemptions")
    .select("*", { count: "exact", head: true });

  const { count: rewardsCount } = await supabase
    .from("rm_rewards")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold mt-1">{usersCount ?? 0}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Activities</p>
          <p className="text-3xl font-bold mt-1">{activitiesCount ?? 0}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Active Rewards</p>
          <p className="text-3xl font-bold mt-1">{rewardsCount ?? 0}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Redemptions</p>
          <p className="text-3xl font-bold mt-1">{redemptionsCount ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
