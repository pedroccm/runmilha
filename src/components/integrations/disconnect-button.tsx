"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DisconnectButtonProps {
  provider: "strava" | "polar" | "garmin";
}

export function DisconnectButton({ provider }: DisconnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  async function handleDisconnect() {
    setLoading(true);
    const res = await fetch("/api/integrations/disconnect", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });

    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to disconnect");
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Are you sure?</span>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Disconnecting..." : "Confirm"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-muted-foreground hover:text-red-500 font-medium transition-colors"
    >
      Disconnect
    </button>
  );
}
