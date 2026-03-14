import { createClient } from "@/lib/supabase/server";
import { formatMilhas, formatDistance } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch wallet
  const { data: wallet } = await supabase
    .from("rm_wallets")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  // Fetch recent activities
  const { data: activities } = await supabase
    .from("rm_activities")
    .select("*")
    .eq("user_id", user?.id)
    .order("start_date", { ascending: false })
    .limit(5);

  // Fetch user profile with plan
  const { data: profile } = await supabase
    .from("rm_users")
    .select("*, plan:rm_plans(*)")
    .eq("id", user?.id)
    .single();

  // Fetch Strava connection status
  const { data: strava } = await supabase
    .from("rm_strava_connections")
    .select("id")
    .eq("user_id", user?.id)
    .single();

  const balance = wallet?.balance ?? 0;
  const totalEarned = wallet?.total_earned ?? 0;
  const totalSpent = wallet?.total_spent ?? 0;
  const unit = (profile?.unit_preference as "km" | "mi") ?? "km";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
        </p>
      </div>

      {/* Strava Connection Banner */}
      {!strava && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Connect your Strava account</p>
            <p className="text-sm text-muted-foreground">
              Link your Strava to start earning PaceCoin automatically.
            </p>
          </div>
          <Link
            href="/settings"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Connect Strava
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-3xl font-bold text-primary mt-1">
            {formatMilhas(balance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PaceCoin</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Earned</p>
          <p className="text-3xl font-bold mt-1">{formatMilhas(totalEarned)}</p>
          <p className="text-xs text-muted-foreground mt-1">PaceCoin</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-3xl font-bold mt-1">{formatMilhas(totalSpent)}</p>
          <p className="text-xs text-muted-foreground mt-1">PaceCoin</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="text-3xl font-bold mt-1">
            {profile?.plan?.name ?? "Free"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {profile?.plan?.conversion_rate ?? 0.5}x rate
          </p>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Activities</h2>
          <Link
            href="/activities"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {activities && activities.length > 0 ? (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-lg">
                      {activity.type === "Run" || activity.type === "VirtualRun"
                        ? "\u{1F3C3}"
                        : "\u{1F6B4}"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {activity.name || activity.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistance(activity.distance_km, unit)} {unit} &middot;{" "}
                      {new Date(activity.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary text-sm">
                    +{formatMilhas(activity.milhas_earned ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">PaceCoin</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">
              No activities yet. Connect Strava and start training!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
