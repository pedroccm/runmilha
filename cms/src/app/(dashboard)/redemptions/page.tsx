import { createAdminClient } from "@/lib/supabase/admin";
import { formatMilhas } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RedemptionsPage() {
  const supabase = createAdminClient();

  const { data: redemptions } = await supabase
    .from("rm_redemptions")
    .select("*, reward:rm_rewards(title, cost_milhas, partner_name), user:rm_users(full_name)")
    .order("redeemed_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Redemptions</h1>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Reward</th>
              <th className="text-left px-4 py-3 font-medium">Partner</th>
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-right px-4 py-3 font-medium">Cost</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {redemptions?.map((r) => (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">{r.user?.full_name || "—"}</td>
                <td className="px-4 py-3 font-medium">{r.reward?.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.reward?.partner_name || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.promo_code}</td>
                <td className="px-4 py-3 text-right text-accent">{formatMilhas(r.reward?.cost_milhas ?? 0)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === "active" ? "bg-green-500/10 text-green-500"
                      : r.status === "used" ? "bg-muted text-muted-foreground"
                      : "bg-destructive/10 text-destructive"
                  }`}>
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
          <p className="p-8 text-center text-muted-foreground">No redemptions yet</p>
        )}
      </div>
    </div>
  );
}
