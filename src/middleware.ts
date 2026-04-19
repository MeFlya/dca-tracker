import { NextResponse, type NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/account(.*)"]);

// Built once at module load — safe, just creates a function, doesn't call Clerk API
const _clerkMw = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

const CANONICAL_HOST = "dcatracker.fr";

export default function middleware(req: NextRequest, evt: NextFetchEvent) {
  // Redirect any *.vercel.app request to the canonical domain.
  // This prevents Google from indexing duplicate content on the Vercel subdomain
  // and forces it to select dcatracker.fr as the canonical URL.
  const host = req.headers.get("host") ?? req.nextUrl.hostname;
  if (host.endsWith(".vercel.app")) {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, { status: 301 });
  }

  // Guard: if Clerk env vars are missing, pass through without auth.
  // Prevents MIDDLEWARE_INVOCATION_FAILED when keys aren't set in Vercel yet.
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !process.env.CLERK_SECRET_KEY
  ) {
    return NextResponse.next();
  }
  return _clerkMw(req, evt);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
