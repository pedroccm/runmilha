import { createAdminClient } from "@/lib/supabase/admin";
import { formatMilhas } from "@/lib/utils";

export default async function AdminRedemptionsPage() {
  const supabase = createAdminClient();

  const { data: redemptions } = await supabase
    .from("rm_redemptions")
    .select("*, reward:rm_rewards(title, cost_milhas, partner_name), user:rm_users(full_name)")
    .order("redeemed_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Redemptions</h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                User
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Reward
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Code
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Cost
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {redemptions?.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-sm">
                  {r.user?.full_name || "Unknown"}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{r.reward?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.reward?.partner_name}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm">{r.promo_code}</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatMilhas(r.reward?.cost_milhas ?? 0)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.status === "active"
                        ? "bg-green-500/10 text-green-500"
                        : r.status === "used"
                          ? "bg-muted text-muted-foreground"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(r.redeemed_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!redemptions || redemptions.length === 0) && (
          <div className="p-8 text-center text-muted-foreground">
            No redemptions yet.
          </div>
        )}
      </div>
    </div>
  );
}
