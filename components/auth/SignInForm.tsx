// components/auth/SignInForm.tsx
//
// Custom sign-in form built directly on the Clerk API (no <SignIn /> widget).
// Built against the Clerk v7 / Core 3 "Future" API:
//   - useSignIn() returns { signIn, errors, fetchStatus } (no isLoaded/setActive)
//   - signIn.password({ emailAddress, password }) starts the attempt
//   - signIn.finalize() completes it and creates the session
// Docs: https://clerk.com/docs/guides/development/custom-flows/authentication/email-password

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";

import Logo from "@/components/auth/Logo";
import SocialButtons from "@/components/auth/SocialButtons";
import Divider from "@/components/auth/Divider";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function SignInForm() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  // Local form state
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  // A generic, user-facing error for things that aren't tied to a specific field
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = fetchStatus === "fetching";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    // Step 1: attempt to sign in with email + password
    const { error } = await signIn.password({
      emailAddress,
      password,
    });

    if (error) {
      // Field-specific errors (bad email format, etc.) are already surfaced
      // via `errors.fields.*` below the relevant input.
      // This covers anything else, e.g. wrong password / account not found.
      console.error(JSON.stringify(error, null, 2));
      setFormError(
        error.longMessage ?? "Invalid email or password. Please try again."
      );
      return;
    }

    // Step 2: react to the resulting status
    if (signIn.status === "complete") {
      // Finalize creates the session and hands us a `navigate` callback
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          // Handle any pending session tasks (e.g. org selection) first
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
    } else if (signIn.status === "needs_second_factor") {
      // MFA is enabled for this account.
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
      setFormError("Two-factor authentication is required for this account.");
    } else {
      // Any other status we don't explicitly handle yet
      console.error("Sign-in attempt not complete:", signIn);
      setFormError("Unable to sign in right now. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Logo />

      {/* Heading copy specific to sign-in */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Pick up where you left off.
        </p>
      </div>

      <SocialButtons />

      <Divider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          id="emailAddress"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          error={errors?.fields?.identifier?.message}
          required
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-zinc-300">
              Password
            </label>
            {/* Forgot password link — required by spec, points to /forgot-password */}
            <Link
              href="/forgot-password"
              className="text-xs text-zinc-400 hover:text-white transition"
            >
              Forgot password?
            </Link>
          </div>
          <AuthInput
            id="password"
            type="password"
            label=""
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors?.fields?.password?.message}
            required
            className="mt-0"
          />
        </div>

        {formError && (
          <p className="text-sm text-red-400 text-center">{formError}</p>
        )}

        {/* Required DOM mount point for Clerk's bot sign-up protection.
            Safe to leave in even while you have it turned off in the
            Dashboard — it just renders nothing until re-enabled. */}
        <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="normal" />

        <AuthButton type="submit" loading={isLoading}>
          Sign in
        </AuthButton>
      </form>

      <p className="text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-white font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}