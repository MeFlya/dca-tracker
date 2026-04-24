/**
 * AmbientBackground — animated mesh gradient using pure CSS radial-gradients.
 *
 * Performance-first: NO blur() filters (those were killing GPU/battery),
 * NO compositor-heavy layers. Just stacked radial-gradients animated via
 * `background-position`. Essentially free — same cost as a static gradient.
 *
 * Visual effect: "liquid" mesh that shifts slowly across the viewport.
 * Rendered at `z-[-10]` under all content; `pointer-events-none`.
 *
 * Mounted once in app/layout.tsx so every page gets the same ambient depth.
 */
export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none animate-mesh"
      style={{
        /* Stack of 4 radial gradients acting as "mesh control points".
           Each one is a soft colored blob; overlap creates smooth mesh.
           Background-size 200% lets us animate the position and have
           the colors actually shift across the viewport. */
        backgroundImage: [
          // Top-left primary blue blob
          "radial-gradient(800px circle at 15% 20%, rgba(59, 130, 246, 0.28), transparent 50%)",
          // Top-right sky blue blob
          "radial-gradient(900px circle at 85% 30%, rgba(14, 165, 233, 0.25), transparent 55%)",
          // Bottom-left indigo blob
          "radial-gradient(700px circle at 25% 80%, rgba(99, 102, 241, 0.22), transparent 50%)",
          // Bottom-right primary light blob
          "radial-gradient(800px circle at 75% 75%, rgba(96, 165, 250, 0.20), transparent 50%)",
          // Base gradient — cool tint, never pure white
          "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #eff6ff 100%)",
        ].join(", "),
        backgroundSize: "200% 200%, 200% 200%, 200% 200%, 200% 200%, 100% 100%",
      }}
      aria-hidden
    >
      {/* Ambient grid — kept from before. Cheap (single background-image). */}
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
