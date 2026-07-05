// app/(auth)/sso-callback/page.tsx
//
// After a user clicks a social login button, the OAuth provider redirects
// back here (this is the `redirectCallbackUrl` passed to `signIn.sso()` in
// SocialButtons.tsx). This component finishes the handshake and creates
// the session automatically — it doesn't need any custom logic of its own.
//
// NOTE: Wrapped in <Suspense> — see the comment in sign-in/page.tsx for why.
// This route is ALSO the most common place the "redirected back but nothing
// happened" symptom shows up if it isn't marked public in your proxy/middleware
// matcher — see the note at the bottom of this file.

"use client";

import { Suspense } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <Suspense fallback={<p className="text-zinc-300">Finishing sign in...</p>}>
      <AuthenticateWithRedirectCallback />
    </Suspense>
  );
}

// If /sso-callback is not listed as a public route in your proxy.ts /
// middleware.ts matcher, Clerk's middleware will bounce the still-unauthenticated
// mid-flow request back to /sign-in with a redirect_url param instead of letting
// this page finish the OAuth handshake — which looks exactly like "it redirected
// me back to the same page and nothing happened."