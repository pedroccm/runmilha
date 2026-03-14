import { createClient } from "@/lib/supabase/server";
import { formatMilhas, formatDistance, formatDuration, formatPace } from "@/lib/utils";

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: activities }, { data: profile }] = await Promise.all([
    supabase
      .from("rm_activities")
      .select("*")
      .eq("user_id", user?.id)
      .order("start_date", { ascending: false })
      .limit(100),
    supabase
      .from("rm_users")
      .select("unit_preference")
      .eq("id", user?.id)
      .single(),
  ]);

  const unit = (profile?.unit_preference as "km" | "mi") ?? "km";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Activities</h1>
        <p className="text-muted-foreground mt-1">
          All your synced activities from Strava
        </p>
      </div>

      {activities && activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-primary text-lg">
                      {activity.type === "Run" || activity.type === "VirtualRun"
                        ? "\u{1F3C3}"
                        : "\u{1F6B4}"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {activity.name || activity.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.start_date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    +{formatMilhas(activity.milhas_earned ?? 0)} CoinMilhas
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-semibold">
                    {formatDistance(activity.distance_km, unit)} {unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold">
                    {activity.moving_time_seconds
                      ? formatDuration(activity.moving_time_seconds)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pace</p>
                  <p className="font-semibold">
                    {activity.moving_time_seconds
                      ? formatPace(
                          activity.distance_km,
                          activity.moving_time_seconds,
                          unit
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">🏃</p>
          <p className="font-medium">No activities yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your Strava and your activities will appear here
            automatically.
          </p>
        </div>
      )}
    </div>
  );
}
