// app/sso-callback/page.tsx
//
// FIX: The previous version of this page used the LEGACY
// <AuthenticateWithRedirectCallback /> component, which completes flows
// started with the old signIn.authenticateWithRedirect() /
// signUp.authenticateWithRedirect() methods.
//
// This app's SocialButtons.tsx calls signIn.sso(...) — the Clerk FUTURE
// API's OAuth method — which is a completely different flow under the
// hood. The legacy callback component doesn't know how to finish it, so
// the redirect back from Google/GitHub/LinkedIn just hung/failed here.
//
// This version uses useClerk() / useSignIn() / useSignUp() (Future API)
// to inspect the in-progress signIn/signUp after the OAuth redirect and
// finalize whichever one applies. Adapted from Clerk's official example:
// https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections

"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SSOCallbackPage() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const hasRun = useRef(false);

  const navigateToSignIn = () => router.push("/sign-in");

  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(session.currentTask);
          return;
        }
        const url = decorateUrl("/dashboard");
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url);
        }
      },
    });
  };

  const finalizeSignUp = async () => {
    await signUp.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(session.currentTask);
          return;
        }
        const url = decorateUrl("/dashboard");
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url);
        }
      },
    });
  };

  useEffect(() => {
    (async () => {
      if (!clerk.loaded || hasRun.current) return;
      // Prevent this effect from re-running when the page re-renders
      // during session activation.
      hasRun.current = true;

      // Plain sign-in completed via OAuth.
      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      // The sign-up was for an account that already exists — transfer
      // into a sign-in.
      if (signUp.isTransferable) {
        await signIn.create({ transfer: true });
        if ((signIn.status as string) === "complete") {
          await finalizeSignIn();
          return;
        }
        // Needs more info (e.g. MFA) — let /sign-in handle it.
        return navigateToSignIn();
      }

      if (
        signIn.status === "needs_first_factor" &&
        !signIn.supportedFirstFactors?.every((f) => f.strategy === "enterprise_sso")
      ) {
        return navigateToSignIn();
      }

      // The sign-in used an OAuth account with no matching user yet —
      // transfer into a sign-up.
      if (signIn.isTransferable) {
        await signUp.create({ transfer: true });
        if (signUp.status === "complete") {
          await finalizeSignUp();
          return;
        }
        // Needs more info (username/first+last name, etc.) — this is the
        // case ContinueSignUpForm.tsx (app/(auth)/sign-up/continue) exists
        // to handle.
        return router.push("/sign-up/continue");
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      if (signIn.status === "needs_second_factor" || signIn.status === "needs_new_password") {
        return navigateToSignIn();
      }

      // The external account was already linked to an existing user with
      // an active session on this client — just activate it.
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
              const url = decorateUrl("/dashboard");
              if (url.startsWith("http")) {
                window.location.href = url;
              } else {
                router.push(url);
              }
            },
          });
        }
      }
    })();
  }, [clerk, signIn, signUp]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      {/* A sign-in that transfers into a sign-up can require captcha —
          this mount point needs to exist here too. */}
      <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="normal" />
      <p className="text-zinc-300">Finishing sign in...</p>
    </div>
  );
}