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
//
// Note (2026-04-29): the Google Analytics loader has been removed from this
// module to keep the site cookieless and exempt from prior-consent requirement
// (CNIL guidance). Plausible is the sole analytics provider.

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
