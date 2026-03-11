"use client";

export function StravaConnectButton() {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI;

  const stravaUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri || ""
  )}&response_type=code&scope=read,activity:read_all&approval_prompt=auto`;

  return (
    <a
      href={stravaUrl}
      className="inline-flex items-center gap-2 bg-[#FC4C02] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#e54502] transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      Connect with Strava
    </a>
  );
}
