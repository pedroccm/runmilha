"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UnitToggle({ current }: { current: "km" | "mi" }) {
  const [selected, setSelected] = useState(current);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(unit: "km" | "mi") {
    if (unit === selected || loading) return;
    setLoading(true);
    setSelected(unit);

    await fetch("/api/user/unit-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unit }),
    });

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {(["km", "mi"] as const).map((unit) => (
        <button
          key={unit}
          onClick={() => handleChange(unit)}
          disabled={loading}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selected === unit
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {unit === "km" ? "Km" : "Miles"}
        </button>
      ))}
    </div>
  );
}
