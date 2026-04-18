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

export default function middleware(req: NextRequest, evt: NextFetchEvent) {
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
