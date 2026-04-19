// Lightweight structured logger for server-side code.
//
// Format: [module/action] status key1=value1 key2=value2 ...
//
// Examples:
//   log.event("strategy/save", "success", { userId, plan });
//   log.event("webhook/stripe", "event", { type: "checkout.session.completed", userId });
//   log.error("csv/parse", "failure", { format, reason: "unknown_separator" });
//
// Stays out of the client bundle (no browser APIs). Safe to import from
// server components, API routes, and cron jobs.

type Context = Record<string, string | number | boolean | null | undefined>;

function formatContext(ctx?: Context): string {
  if (!ctx) return "";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(ctx)) {
    if (v === undefined) continue;
    if (v === null) { parts.push(`${k}=null`); continue; }
    // Quote string values with spaces or equals signs
    const str = String(v);
    if (/[\s=]/.test(str)) parts.push(`${k}="${str}"`);
    else parts.push(`${k}=${str}`);
  }
  return parts.length ? " " + parts.join(" ") : "";
}

export const log = {
  /** Business event (success path or informational). */
  event(module: string, status: string, ctx?: Context): void {
    console.log(`[${module}] ${status}${formatContext(ctx)}`);
  },

  /** Warning — non-critical, but worth investigating. */
  warn(module: string, status: string, ctx?: Context): void {
    console.warn(`[${module}] ${status}${formatContext(ctx)}`);
  },

  /** Error — request failed, cron failed, etc. Surface via Vercel logs. */
  error(module: string, status: string, ctx?: Context, err?: unknown): void {
    const errInfo = err instanceof Error
      ? { error_name: err.name, error_message: err.message }
      : err !== undefined
        ? { error: String(err) }
        : {};
    console.error(`[${module}] ${status}${formatContext({ ...ctx, ...errInfo })}`);
  },
};
