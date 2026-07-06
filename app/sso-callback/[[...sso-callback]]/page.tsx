// app/sso-callback/[[...sso-callback]]/page.tsx
//
// This is the ONE shared callback route for ALL OAuth redirects — both the
// sign-in and sign-up flows point here. Do not split this into separate
// /sso-callback/sign-in and /sso-callback/sign-up routes: Clerk doesn't
// know in advance whether an OAuth redirect will resolve as a sign-in, a
// sign-up, or a "transfer" between the two (e.g. user clicked "sign in"
// with Google but has no account yet, or vice versa) — this page's job is
// to figure that out and finish whichever one applies.
//
// IMPORTANT: this intentionally does NOT use <AuthenticateWithRedirectCallback />.
// That component belongs to Clerk's older (legacy) API. Since the rest of
// this app is built on the newer "Future" API (signIn.sso(), .finalize(),
// etc.), mixing in the legacy callback component is what caused the
// "Google button spins forever" / "bounces back to sign-up" bugs — the
// legacy component doesn't know how to finalize a Future-API attempt.
//
// Adapted directly from Clerk's official example:
// https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();

  // Prevents this effect from re-running (and re-attempting the flow)
  // when the page re-renders during session activation.
  const hasRun = useRef(false);

  function navigateToSignIn() {
    router.push("/sign-in");
  }

  async function finalizeSignIn() {
    await signIn.finalize({
      navigate: async ({ session, decorateUrl }) => {
        // Handle any pending session tasks (e.g. org selection) first.
        // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
        if (session?.currentTask) {
          console.log(session.currentTask);
          return;
        }
        const url = decorateUrl("/");
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url);
        }
      },
    });
  }

  async function finalizeSignUp() {
    await signUp.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(session.currentTask);
          return;
        }
        const url = decorateUrl("/");
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url);
        }
      },
    });
  }

  useEffect(() => {
    (async () => {
      if (!clerk.loaded || hasRun.current) return;
      hasRun.current = true;

      // Case 1: this was a sign-in and it's already complete — done.
      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      // Case 2: the user tried to sign up with an OAuth account that
      // already exists — Clerk marks the sign-up as "transferable" into
      // a sign-in instead.
      if (signUp.isTransferable) {
        await signIn.create({ transfer: true });
        if ((signIn.status as typeof signIn.status | "complete") === "complete") {
          await finalizeSignIn();
          return;
        }
        // Sign-in needs more info than we handle here (e.g. a first
        // factor); send them back to the sign-in page to complete it.
        return navigateToSignIn();
      }

      // Case 3: the sign-in requires a first factor we don't support here.
      if (
        signIn.status === "needs_first_factor" &&
        !signIn.supportedFirstFactors?.every((f) => f.strategy === "enterprise_sso")
      ) {
        return navigateToSignIn();
      }

      // Case 4: the user tried to sign in with an OAuth account that has
      // no matching Clerk account yet — transfer into a sign-up instead.
      if (signIn.isTransferable) {
        await signUp.create({ transfer: true });

        if (signUp.status === "complete") {
          await finalizeSignUp();
          return;
        }

        // Needs more info (e.g. missing name/username) — send to a page
        // that collects it. See the "Handle missing requirements" section:
        // https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections#handle-missing-requirements
        return router.push("/sign-up/continue");
      }

      // Case 5: sign-up is already complete — finalize it.
      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      // Case 6: MFA or a new password is required — hand back to sign-in.
      if (signIn.status === "needs_second_factor" || signIn.status === "needs_new_password") {
        return navigateToSignIn();
      }

      // Case 7: the OAuth account was already linked to an active session
      // on this client/browser — just activate that session directly.
      if (signIn.existingSession || signUp.existingSession) {
        const sessionId =
          signIn.existingSession?.sessionId || signUp.existingSession?.sessionId;
        if (sessionId) {
          await clerk.setActive({
            session: sessionId,
            navigate: async ({ session, decorateUrl }) => {
              if (session?.currentTask) {
                console.log(session.currentTask);
                return;
              }
              const url = decorateUrl("/");
              if (url.startsWith("http")) {
                window.location.href = url;
              } else {
                router.push(url);
              }
            },
          });
          return;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerk, signIn, signUp]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <p className="text-zinc-300">Finishing sign in...</p>
      {/* A sign-up transferred from a sign-in might require captcha
          verification, so this element must be present for bot
          protection to work if/when you turn it back on. */}
      <div id="clerk-captcha" />
    </div>
  );
}