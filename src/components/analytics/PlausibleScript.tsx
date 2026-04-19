// Plausible script loader — uses the new per-site `pa-*` script format.
//
// Plausible gives you a snippet like this on the dashboard:
//   <script async src="https://plausible.io/js/pa-XXXXXXXXXXXXXX.js"></script>
//   <script>
//     window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
//     plausible.init()
//   </script>
//
// We replicate that here, with the src URL coming from env.
// Only renders when NEXT_PUBLIC_PLAUSIBLE_SRC is set.

import Script from "next/script";

const PLAUSIBLE_INIT = `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`;

export function PlausibleScript() {
  const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC;
  if (!src) return null;

  return (
    <>
      <Script
        async
        src={src}
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {PLAUSIBLE_INIT}
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
