import { createClient } from "@/lib/supabase/server";
import { StravaConnectButton } from "@/components/strava/connect-button";
import { DisconnectButton } from "@/components/integrations/disconnect-button";
import { UnitToggle } from "@/components/settings/unit-toggle";
import { formatMilhas } from "@/lib/utils";

const MESSAGES: Record<string, { type: "success" | "error"; text: string }> = {
  strava_connected: { type: "success", text: "Strava connected successfully!" },
  strava_denied: { type: "error", text: "Strava connection was denied." },
  strava_failed: { type: "error", text: "Failed to connect Strava. Please try again." },
  account_setup: { type: "success", text: "Account set up successfully. You can now log in with email and password." },
  polar_connected: { type: "success", text: "Polar connected successfully!" },
  polar_denied: { type: "error", text: "Polar connection was denied." },
  polar_failed: { type: "error", text: "Failed to connect Polar. Please try again." },
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;

  const messageKey = params.success ?? params.error;
  const message = messageKey ? MESSAGES[messageKey] : null;

  const { data: profile } = await supabase
    .from("rm_users")
    .select("*, plan:rm_plans(*)")
    .eq("id", user?.id)
    .single();

  const [{ data: strava }] = await Promise.all([
    supabase.from("rm_strava_connections").select("*").eq("user_id", user?.id).single(),
  ]);

  // User's redeemed rewards
  const { data: redemptions } = await supabase
    .from("rm_redemptions")
    .select("*, reward:rm_rewards(*)")
    .eq("user_id", user?.id)
    .order("redeemed_at", { ascending: false });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and connections
        </p>
      </div>

      {/* Feedback banner */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Profile</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">
              {profile?.full_name || "Not set"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="text-sm font-medium">
              {profile?.plan?.name ?? "Free"} ({profile?.plan?.conversion_rate ?? 0.5}x)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Distance unit</span>
            <UnitToggle current={(profile?.unit_preference as "km" | "mi") ?? "km"} />
          </div>
        </div>
      </div>

      {/* Connected Services */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Connected Services</h2>
        <div className="space-y-4">
          {/* Strava */}
          {strava ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FC4C02]/10 flex items-center justify-center">
                  <span className="text-[#FC4C02] font-bold text-sm">S</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Strava</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded-full">
                  Active
                </span>
                <DisconnectButton provider="strava" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FC4C02]/10 flex items-center justify-center">
                  <span className="text-[#FC4C02] font-bold text-sm">S</span>
                </div>
                <p className="font-medium text-sm">Strava</p>
              </div>
              <StravaConnectButton />
            </div>
          )}
        </div>
      </div>

      {/* My Rewards */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">My Rewards</h2>
        {redemptions && redemptions.length > 0 ? (
          <div className="space-y-3">
            {redemptions.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {r.reward?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.redeemed_at).toLocaleDateString()} &middot;{" "}
                    {formatMilhas(r.reward?.cost_milhas ?? 0)} milhas
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold">{r.promo_code}</p>
                  <p
                    className={`text-xs ${
                      r.status === "active"
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {r.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No rewards redeemed yet. Visit the marketplace to get started.
          </p>
        )}
      </div>
    </div>
  );
}
