import { PolarConnectButton } from "@/components/polar/connect-button";

export default function PolarConnectPage() {
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-[#D30024]/10 flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-[#D30024]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Connect Polar</h1>
      <p className="text-muted-foreground">
        Link your Polar account to automatically sync your training sessions.
        We&apos;ll convert your kilometers into milhas based on your plan.
      </p>
      <PolarConnectButton />
      <p className="text-xs text-muted-foreground">
        Requires Polar Flow account. We only read your exercise data.
      </p>
    </div>
  );
}
