"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Reward } from "@/types/database";

export default function EditRewardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadReward();
  }, [id]);

  async function loadReward() {
    const { data } = await supabase.from("rm_rewards").select("*").eq("id", id).single();
    setReward(data);
  }

  function update(field: string, value: string | number | boolean | null) {
    if (!reward) return;
    setReward({ ...reward, [field]: value });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!reward) return;
    setLoading(true);

    await supabase
      .from("rm_rewards")
      .update({
        title: reward.title,
        description: reward.description,
        image_url: reward.image_url,
        cost_milhas: reward.cost_milhas,
        category: reward.category,
        partner_name: reward.partner_name,
        promo_code_prefix: reward.promo_code_prefix,
        total_stock: reward.total_stock,
        remaining_stock: reward.remaining_stock,
        min_plan_slug: reward.min_plan_slug,
        valid_until: reward.valid_until,
        is_active: reward.is_active,
      })
      .eq("id", id);

    setMessage("Saved");
    setLoading(false);
  }

  async function toggleActive() {
    if (!reward) return;
    await supabase.from("rm_rewards").update({ is_active: !reward.is_active }).eq("id", id);
    setReward({ ...reward, is_active: !reward.is_active });
    setMessage(reward.is_active ? "Deactivated" : "Activated");
  }

  async function deleteReward() {
    if (!confirm("Delete this reward?")) return;
    await supabase.from("rm_rewards").delete().eq("id", id);
    router.push("/rewards");
  }

  if (!reward) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold">Edit Reward</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          reward.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
        }`}>
          {reward.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {message && (
        <div className="bg-green-500/10 text-green-500 text-sm px-4 py-2 rounded-lg">{message}</div>
      )}

      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <Field label="Title">
          <input value={reward.title} onChange={(e) => update("title", e.target.value)} required className="input" />
        </Field>
        <Field label="Description">
          <textarea value={reward.description || ""} onChange={(e) => update("description", e.target.value)} rows={3} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Partner">
            <input value={reward.partner_name || ""} onChange={(e) => update("partner_name", e.target.value)} className="input" />
          </Field>
          <Field label="Cost (milhas)">
            <input type="number" value={reward.cost_milhas} onChange={(e) => update("cost_milhas", parseFloat(e.target.value))} className="input" />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Total Stock">
            <input type="number" value={reward.total_stock ?? ""} onChange={(e) => update("total_stock", e.target.value ? parseInt(e.target.value) : null)} className="input" />
          </Field>
          <Field label="Remaining">
            <input type="number" value={reward.remaining_stock ?? ""} onChange={(e) => update("remaining_stock", e.target.value ? parseInt(e.target.value) : null)} className="input" />
          </Field>
          <Field label="Promo Prefix">
            <input value={reward.promo_code_prefix || ""} onChange={(e) => update("promo_code_prefix", e.target.value)} className="input" />
          </Field>
        </div>
        <Field label="Image URL">
          <input value={reward.image_url || ""} onChange={(e) => update("image_url", e.target.value)} className="input" />
        </Field>

        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="flex gap-3">
        <button onClick={toggleActive} className={`flex-1 py-2 rounded-lg text-sm font-medium ${
          reward.is_active ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"
        }`}>
          {reward.is_active ? "Deactivate" : "Activate"}
        </button>
        <button onClick={deleteReward} className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive">
          Delete
        </button>
      </div>

      <style>{`
        .input {
          width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem;
          border: 1px solid var(--color-border); background: var(--color-background);
          font-size: 0.875rem; color: var(--color-foreground);
        }
        .input:focus { outline: none; box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 50%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium mb-1">{label}</label>{children}</div>;
}
