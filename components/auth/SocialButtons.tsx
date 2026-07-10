// components/auth/SocialButtons.tsx
//
// Icon-only social login buttons, side by side. Used on BOTH the sign-in
// and sign-up pages.
//
// NOTE: For OAuth/SSO, Clerk treats sign-in and sign-up as the same flow —
// if the account doesn't exist yet, Clerk can transfer into sign-up
// automatically. This component uses Clerk's supported SSO helper.
// Docs: https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections

"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import type { OAuthStrategy } from "@clerk/shared/types";

// Each provider we support. Add more here later if needed (Apple, Microsoft, etc.)
// as long as they're enabled as Social Connections in the Clerk Dashboard.
const PROVIDERS: { strategy: OAuthStrategy; label: string; icon: ReactElement }[] = [
  {
    strategy: "oauth_google",
    label: "Continue with Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.24 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3 14.6 2 12 2 6.9 2 2.7 6.1 2.7 11.8s4.2 9.8 9.3 9.8c5.4 0 9-3.8 9-9.1 0-.6-.1-1.1-.2-1.5H12z"
        />
      </svg>
    ),
  },
  {
    strategy: "oauth_github",
    label: "Continue with GitHub",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.6-2.7 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
      </svg>
    ),
  },
  {
    // LinkedIn migrated to standard OIDC scopes — use `oauth_linkedin_oidc`
    strategy: "oauth_linkedin_oidc",
    label: "Continue with LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#0A66C2">
        <path d="M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.2V9h3.5v1.6h.05c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM7.1 20.4H3.5V9h3.6v11.4Z" />
      </svg>
    ),
  },
];

// -----------------------------------------------------------------------
// Clerk's OAuth helpers can still throw runtime errors (for example, if a
// session already exists). We check for that shape safely instead of
// relying on a specific Clerk error type.
// Clerk's `.password()`/`.sso()` methods type their `error` return as
// `ClerkError`, which only guarantees `{ message, code, longMessage?,
// cause? }`. At runtime, some errors (like this "already signed in" case)
// are actually the wider `ClerkAPIResponseError` shape, which nests the
// real error list under `.errors`. TypeScript can't see that from the
// declared `ClerkError` type, so we check for it safely at runtime
// instead of relying on a type-narrowing method.
// -----------------------------------------------------------------------
function isSessionExistsError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  // Case 1: the code is directly on the error object
  if ("code" in error && (error as { code?: string }).code === "session_exists") {
    return true;
  }

  // Case 2: it's a ClerkAPIResponseError-shaped object with a nested list
  if ("errors" in error) {
    const nested = (error as { errors?: unknown }).errors;
    if (Array.isArray(nested)) {
      return nested.some((e) => (e as { code?: string })?.code === "session_exists");
    }
  }

  return false;
}

export default function SocialButtons() {
  const { signIn } = useSignIn();
  const router = useRouter();
  // Track which specific provider is loading so only that button shows a spinner
  const [loadingStrategy, setLoadingStrategy] = useState<OAuthStrategy | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);

  async function handleOAuth(strategy: OAuthStrategy) {
    setSocialError(null);
    setLoadingStrategy(strategy);
    try {
      const { error } = await signIn.sso({
        strategy,
        redirectUrl: "/dashboard",
        redirectCallbackUrl: "/sso-callback",
      });
      if (error) {
        if (isSessionExistsError(error)) {
          router.push("/dashboard");
          return;
        }

        console.error(JSON.stringify(error, null, 2));
        setSocialError("Something went wrong. Please try again.");
        setLoadingStrategy(null);
      }
    } catch (err) {
      console.error(err);
      setSocialError("Something went wrong. Please try again.");
      setLoadingStrategy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center gap-25">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.strategy}
            type="button"
            aria-label={provider.label}
            title={provider.label}
            disabled={loadingStrategy !== null}
            onClick={() => handleOAuth(provider.strategy)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border
              border-white/10 bg-white/5 transition hover:bg-white/10
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStrategy === provider.strategy ? (
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              provider.icon
            )}
          </button>
        ))}
      </div>
      {socialError && (
        <p className="text-center text-xs text-red-400">{socialError}</p>
      )}
    </div>
  );
}
