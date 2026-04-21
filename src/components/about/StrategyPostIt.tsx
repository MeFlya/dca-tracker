import { Caveat } from "next/font/google";

// Loaded locally so Caveat only hits the /a-propos page.
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const LINES = [
  "1/2 à 2/3 du salaire",
  "DCA ETF monde · PEA",
  "Auto le lendemain du salaire",
  "Horizon 20-30 ans",
  "Pas de trading",
];

/**
 * Visual "post-it" reproducing the hand-written strategy note mentioned in the
 * /a-propos copy. Yellow background, slight rotation, soft shadow. Serves as
 * the founder's "face" in absence of a photo.
 */
export function StrategyPostIt() {
  return (
    <aside
      aria-label="Note manuscrite : ma stratégie"
      className="relative mx-auto w-full max-w-[280px] rotate-[-1.5deg] rounded-sm bg-[#fef3c7] px-6 py-7 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.18),0_2px_4px_-1px_rgba(0,0,0,0.06)] ring-1 ring-amber-200/60"
    >
      <h2
        className={`${caveat.className} text-3xl font-bold text-amber-900 leading-none mb-1`}
      >
        Ma stratégie
      </h2>
      <div className="h-px w-16 bg-amber-300 mb-4" aria-hidden />
      <ul className={`${caveat.className} space-y-1.5 text-xl text-amber-950`}>
        {LINES.map((line) => (
          <li key={line} className="flex items-start gap-2 leading-snug">
            <span className="text-amber-700 shrink-0" aria-hidden>
              ✓
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
