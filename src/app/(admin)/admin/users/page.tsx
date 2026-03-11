import { createAdminClient } from "@/lib/supabase/admin";
import { formatMilhas } from "@/lib/utils";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data: users } = await supabase
    .from("rm_users")
    .select("*, plan:rm_plans(name, slug), wallet:rm_wallets(balance, total_earned)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                User
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Plan
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Balance
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Total Earned
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-sm">
                    {u.full_name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {u.id.slice(0, 8)}...
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">{u.plan?.name ?? "Free"}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-primary">
                    {formatMilhas(u.wallet?.balance ?? 0)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">
                    {formatMilhas(u.wallet?.total_earned ?? 0)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
