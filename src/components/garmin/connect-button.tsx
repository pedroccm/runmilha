"use client";

export function GarminConnectButton() {
  const clientId = process.env.NEXT_PUBLIC_GARMIN_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GARMIN_REDIRECT_URI;

  const garminUrl = `https://connect.garmin.com/oauthConfirm?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri || ""
  )}&response_type=code&scope=activity_read`;

  return (
    <a
      href={garminUrl}
      className="inline-flex items-center gap-2 bg-[#007CC3] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#006aaa] transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
      Connect with Garmin
    </a>
  );
}
