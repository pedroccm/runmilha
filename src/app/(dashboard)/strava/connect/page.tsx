import { StravaConnectButton } from "@/components/strava/connect-button";

export default function StravaConnectPage() {
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-[#FC4C02]/10 flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-[#FC4C02]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Connect Strava</h1>
      <p className="text-muted-foreground">
        Link your Strava account to automatically sync your runs and rides.
        We&apos;ll convert your kilometers into milhas based on your plan.
      </p>
      <StravaConnectButton />
      <p className="text-xs text-muted-foreground">
        We only read your activity data. We never post on your behalf.
      </p>
    </div>
  );
}
