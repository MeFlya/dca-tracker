/**
 * AmbientBackground — animated mesh-gradient page background.
 *
 * Fixed to the viewport so it covers the entire scroll area without
 * having to compute page height. Large blurred orbs drift independently
 * in a slow continuous loop, giving the "video feel" without a video
 * asset or heavy canvas/JS. Everything is CSS / SVG, 0 JS runtime.
 *
 * Rendered at `z-[-10]` under all content; `pointer-events-none` so it
 * never blocks clicks. Respects `prefers-reduced-motion` via globals.css.
 *
 * Designed to be mounted ONCE in app/layout.tsx so every page gets the
 * same ambient depth for free. Sections that want their own local bg
 * (Hero grid, dark TrackingPitch) layer on top via z-0 / opaque bg.
 */
export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {/* Base gradient — subtle cool tint, never pure white */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-primary-50/50" />

      {/* Mesh gradient : 4 huge blurred orbs, each on its own drift loop.
          Sized in vw/vh so they scale with viewport.
          blur-[120px] is heavier than blur-3xl (64px) but the payoff is
          real "liquid" look. Modern GPUs handle it fine. */}
      <div className="absolute top-[-15%] left-[-10%] w-[70vw] h-[60vh] rounded-full bg-primary-400/35 blur-[100px] animate-float-a" />
      <div
        className="absolute top-[20%] right-[-15%] w-[65vw] h-[65vh] rounded-full bg-sky-400/30 blur-[100px] animate-float-b"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="absolute bottom-[-15%] left-[15%] w-[60vw] h-[55vh] rounded-full bg-indigo-400/25 blur-[100px] animate-float-a"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="absolute top-[45%] left-[30%] w-[40vw] h-[40vh] rounded-full bg-primary-300/25 blur-[100px] animate-float-b"
        style={{ animationDelay: "-11s" }}
      />

      {/* Ambient grid — keeps the "technical/finance" vibe, very low opacity
          so it doesn't fight the orbs. */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#1d4ed8 1px, transparent 1px), linear-gradient(to right, #1d4ed8 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}
