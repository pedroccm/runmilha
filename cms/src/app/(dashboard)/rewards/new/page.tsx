"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewRewardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
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
    valid_until: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const stock = form.total_stock ? parseInt(form.total_stock) : null;

    await supabase.from("rm_rewards").insert({
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      cost_milhas: parseFloat(form.cost_milhas),
      category: form.category || null,
      partner_name: form.partner_name || null,
      promo_code_prefix: form.promo_code_prefix || "RM",
      total_stock: stock,
      remaining_stock: stock,
      min_plan_slug: form.min_plan_slug || null,
      valid_until: form.valid_until || null,
      is_active: true,
    });

    router.push("/rewards");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold">New Reward</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <Field label="Title *">
          <input value={form.title} onChange={(e) => update("title", e.target.value)} required className="input" />
        </Field>

        <Field label="Description">
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Partner Name">
            <input value={form.partner_name} onChange={(e) => update("partner_name", e.target.value)} className="input" />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className="input">
              <option value="discount">Discount</option>
              <option value="product">Product</option>
              <option value="experience">Experience</option>
              <option value="race">Race Entry</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Cost (milhas) *">
            <input type="number" min="1" value={form.cost_milhas} onChange={(e) => update("cost_milhas", e.target.value)} required className="input" />
          </Field>
          <Field label="Stock (empty=unlimited)">
            <input type="number" min="1" value={form.total_stock} onChange={(e) => update("total_stock", e.target.value)} className="input" />
          </Field>
          <Field label="Promo Prefix">
            <input value={form.promo_code_prefix} onChange={(e) => update("promo_code_prefix", e.target.value)} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Min Plan (slug)">
            <select value={form.min_plan_slug} onChange={(e) => update("min_plan_slug", e.target.value)} className="input">
              <option value="">Any plan</option>
              <option value="basico">Basico+</option>
              <option value="pro">Pro+</option>
              <option value="elite">Elite only</option>
            </select>
          </Field>
          <Field label="Valid Until">
            <input type="date" value={form.valid_until} onChange={(e) => update("valid_until", e.target.value)} className="input" />
          </Field>
        </div>

        <Field label="Image URL">
          <input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://..." className="input" />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Reward"}
        </button>
      </form>

      <style>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          font-size: 0.875rem;
          color: var(--color-foreground);
        }
        .input:focus {
          outline: none;
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 50%, transparent);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
