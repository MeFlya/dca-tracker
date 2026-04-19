// Plausible script loader. Only injected when both env vars are set.
// Uses next/script so the tag loads after interactive and doesn't block rendering.
//
// Plausible has a clean 'only-needs-one-script' model:
//   <script defer data-domain="dcatracker.fr"
//           src="https://plausible.io/js/script.pageview-props.tagged-events.js"></script>
//
// We use the 'tagged-events' variant so custom events auto-tag. The 'pageview-props'
// variant lets us add `data-plausible-*` attributes if needed.

import Script from "next/script";

export function PlausibleScript() {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN;

  if (provider !== "plausible" || !domain) return null;

  return (
    <>
      <Script
        defer
        data-domain={domain}
        src="https://plausible.io/js/script.tagged-events.js"
        strategy="afterInteractive"
      />
      {/* Expose plausible() globally for custom events */}
      <Script id="plausible-custom" strategy="afterInteractive">
        {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
      </Script>
    </>
  );
}

export function GoogleAnalyticsScript() {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (provider !== "ga" || !measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
