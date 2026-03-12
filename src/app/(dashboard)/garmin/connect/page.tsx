import { GarminConnectButton } from "@/components/garmin/connect-button";

export default function GarminConnectPage() {
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-[#007CC3]/10 flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-[#007CC3]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Connect Garmin</h1>
      <p className="text-muted-foreground">
        Link your Garmin account to automatically sync your runs, rides, and hikes.
        We&apos;ll convert your kilometers into milhas based on your plan.
      </p>
      <GarminConnectButton />
      <p className="text-xs text-muted-foreground">
        Requires Garmin Connect account. We only read your activity data.
      </p>
    </div>
  );
}
