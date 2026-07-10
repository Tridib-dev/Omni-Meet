// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/events/discover(.*)",
  "/events/(.*)",      // This must be exact
  "/profile(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/sso-callback(.*)",  
  "/api/events(.*)",
  "/api/webhooks(.*)",
  "/ingest(.*)",
  "/_next(.*)",
  "/favicon.ico",
]);

const isOnboardingRoute = createRouteMatcher([
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const authObject = await auth();

  if (!authObject.userId) {
    return authObject.redirectToSignIn();
  }

  const isOnboarded = Boolean(
    (authObject.sessionClaims as { metadata?: { onboarded?: boolean } } | null | undefined)
      ?.metadata?.onboarded
  );

  if (!isOnboarded && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding/profile", req.url));
  }

  if (isOnboarded && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
