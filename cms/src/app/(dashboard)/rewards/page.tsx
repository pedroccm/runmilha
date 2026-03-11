import { createAdminClient } from "@/lib/supabase/admin";
import { formatMilhas } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const supabase = createAdminClient();

  const { data: rewards } = await supabase
    .from("rm_rewards")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rewards</h1>
        <Link
          href="/rewards/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          + New Reward
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Reward</th>
              <th className="text-left px-4 py-3 font-medium">Partner</th>
              <th className="text-right px-4 py-3 font-medium">Cost</th>
              <th className="text-right px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Valid Until</th>
              <th className="text-left px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rewards?.map((r) => (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.category || "—"}</p>
                </td>
                <td className="px-4 py-3">{r.partner_name || "—"}</td>
                <td className="px-4 py-3 text-right font-medium text-accent">
                  {formatMilhas(r.cost_milhas)}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.remaining_stock !== null
                    ? `${r.remaining_stock}/${r.total_stock}`
                    : "Unlimited"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.is_active
                      ? "bg-green-500/10 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {r.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {r.valid_until ? new Date(r.valid_until).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/rewards/${r.id}`} className="text-xs text-primary hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!rewards || rewards.length === 0) && (
          <p className="p-8 text-center text-muted-foreground">No rewards yet. Create your first one.</p>
        )}
      </div>
    </div>
  );
}
