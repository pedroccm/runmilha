"use client";

export function PolarConnectButton() {
  const clientId = process.env.NEXT_PUBLIC_POLAR_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_POLAR_REDIRECT_URI;

  const polarUrl = `https://flow.polar.com/oauth2/authorization?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri || ""
  )}&response_type=code&scope=accesslink.read_all`;

  return (
    <a
      href={polarUrl}
      className="inline-flex items-center gap-2 bg-[#D30024] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#b5001e] transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      Connect with Polar
    </a>
  );
}
