"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMilhas } from "@/lib/utils";
import type { Reward } from "@/types/database";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    cost_milhas: "",
    category: "discount",
    partner_name: "",
    promo_code_prefix: "RM",
    total_stock: "",
    min_plan_slug: "",
  });
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function loadRewards() {
    const { data } = await supabase
      .from("rm_rewards")
      .select("*")
      .order("created_at", { ascending: false });
    setRewards(data || []);
  }

  useEffect(() => {
    loadRewards();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const stock = form.total_stock ? parseInt(form.total_stock) : null;

    await supabase.from("rm_rewards").insert({
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      cost_milhas: parseFloat(form.cost_milhas),
      category: form.category,
      partner_name: form.partner_name || null,
      promo_code_prefix: form.promo_code_prefix || "RM",
      total_stock: stock,
      remaining_stock: stock,
      min_plan_slug: form.min_plan_slug || null,
      is_active: true,
    });

    setForm({
      title: "",
      description: "",
      image_url: "",
      cost_milhas: "",
      category: "discount",
      partner_name: "",
      promo_code_prefix: "RM",
      total_stock: "",
      min_plan_slug: "",
    });
    setShowForm(false);
    setLoading(false);
    loadRewards();
  }

  async function toggleActive(id: string, currentState: boolean) {
    await supabase
      .from("rm_rewards")
      .update({ is_active: !currentState })
      .eq("id", id);
    loadRewards();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Rewards</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          {showForm ? "Cancel" : "+ Add Reward"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Partner Name
              </label>
              <input
                value={form.partner_name}
                onChange={(e) =>
                  setForm({ ...form, partner_name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Cost (milhas) *
              </label>
              <input
                type="number"
                value={form.cost_milhas}
                onChange={(e) =>
                  setForm({ ...form, cost_milhas: e.target.value })
                }
                required
                min="1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock (empty = unlimited)
              </label>
              <input
                type="number"
                value={form.total_stock}
                onChange={(e) =>
                  setForm({ ...form, total_stock: e.target.value })
                }
                min="1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Promo Prefix
              </label>
              <input
                value={form.promo_code_prefix}
                onChange={(e) =>
                  setForm({ ...form, promo_code_prefix: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Reward"}
          </button>
        </form>
      )}

      {/* Rewards List */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {rewards.length > 0 ? (
          rewards.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{r.title}</p>
                  {!r.is_active && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.partner_name || "No partner"} &middot;{" "}
                  {formatMilhas(r.cost_milhas)} milhas &middot; Stock:{" "}
                  {r.remaining_stock ?? "unlimited"}
                </p>
              </div>
              <button
                onClick={() => toggleActive(r.id, r.is_active)}
                className={`text-xs px-3 py-1 rounded-lg font-medium ${
                  r.is_active
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                }`}
              >
                {r.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No rewards created yet.
          </div>
        )}
      </div>
    </div>
  );
}
