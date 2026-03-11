import { createAdminClient } from "@/lib/supabase/admin";
import { formatMilhas } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = createAdminClient();

  const { data: users } = await supabase
    .from("rm_users")
    .select("*, plan:rm_plans(name, slug, conversion_rate), wallet:rm_wallets(balance, total_earned, total_spent)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Plan</th>
              <th className="text-left px-4 py-3 font-medium">Rate</th>
              <th className="text-right px-4 py-3 font-medium">Balance</th>
              <th className="text-right px-4 py-3 font-medium">Earned</th>
              <th className="text-right px-4 py-3 font-medium">Spent</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
              <th className="text-left px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.full_name || "—"}</p>
                  <p className="text-xs text-muted-foreground font-mono">{u.id.slice(0, 12)}</p>
                </td>
                <td className="px-4 py-3">{u.plan?.name ?? "Free"}</td>
                <td className="px-4 py-3 text-accent">{u.plan?.conversion_rate ?? 0.5}x</td>
                <td className="px-4 py-3 text-right font-medium">{formatMilhas(u.wallet?.balance ?? 0)}</td>
                <td className="px-4 py-3 text-right">{formatMilhas(u.wallet?.total_earned ?? 0)}</td>
                <td className="px-4 py-3 text-right">{formatMilhas(u.wallet?.total_spent ?? 0)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.subscription_status === "active"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {u.subscription_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/users/${u.id}`} className="text-xs text-primary hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <p className="p-8 text-center text-muted-foreground">No users yet</p>
        )}
      </div>
    </div>
  );
}
