import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only the dashboard listing is auth-gated.
// Email-link deep dives at /calls/[id] stay passwordless (unguessable session IDs).
// Audio proxy at /api/recordings/[id] stays passwordless (referenced from those public deep links).
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
