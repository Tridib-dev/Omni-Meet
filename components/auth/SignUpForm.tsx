// components/auth/SignUpForm.tsx
//
// Custom sign-up form built directly on the Clerk API (no <SignUp /> widget).
// Built against the Clerk v7 / Core 3 "Future" API.
//
// Flow:
//   1. User submits email + password -> signUp.password()
//   2. We send a 6-digit email verification code -> signUp.verifications.sendEmailCode()
//   3. User enters the code -> signUp.verifications.verifyEmailCode()
//   4. On success, signUp.status === 'complete' -> signUp.finalize() creates the session
//
// This is exactly the flow requested: verification only kicks in once the
// password step succeeds — the user never sees a code screen for a bad signup.
// Docs: https://clerk.com/docs/guides/development/custom-flows/authentication/email-password
//
// NOTE: There used to be an `oauth_missing=1` query-param workaround here,
// tied to the old <AuthenticateWithRedirectCallback /> sso-callback page.
// That's been removed — the new /sso-callback/[[...sso-callback]] page
// (built on useClerk/useSignIn/useSignUp) now correctly detects and routes
// "OAuth sign-in with no matching account" itself, sending the user to
// /sign-up/continue if extra info is needed, instead of bouncing back here
// with a query param. See that file's comments for the full explanation.
//
// CLERK DASHBOARD REQUIREMENT:
// User & authentication -> Email, phone, username:
//   - Enable "Email address" as an identifier
//   - Under "Verify at sign-up", select "Email verification code" (NOT "link")

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";

import Logo from "@/components/auth/Logo";
import SocialButtons from "@/components/auth/SocialButtons";
import Divider from "@/components/auth/Divider";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function SignUpForm() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  // Step 1 fields
  const [emailAddress, setEmailAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 field
  const [code, setCode] = useState("");

  // Controls which "screen" of the form is showing
  const [pendingVerification, setPendingVerification] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = fetchStatus === "fetching";

  // ---------------------------------------------------------------------
  // Step 1: create the sign-up attempt with email + password
  // ---------------------------------------------------------------------
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const { error } = await signUp.password({
      emailAddress,
      username,
      password,
    });

    if (error) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      console.error(JSON.stringify(error, null, 2));
      setFormError(error.longMessage ?? "Couldn't create your account. Please try again.");
      return;
    }

    // Password step succeeded -> now (and only now) send the verification code.
    const { error: sendCodeError } = await signUp.verifications.sendEmailCode();
    if (sendCodeError) {
      console.error(JSON.stringify(sendCodeError, null, 2));
      setFormError("Couldn't send a verification code. Please try again.");
      return;
    }

    setPendingVerification(true);
  }

  // ---------------------------------------------------------------------
  // Step 2: verify the emailed code, then finalize the sign-up
  // ---------------------------------------------------------------------
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const { error } = await signUp.verifications.verifyEmailCode({ code });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setFormError(error.longMessage ?? "That code didn't work. Please try again.");
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
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
    } else {
      console.error("Sign-up attempt not complete:", signUp);
      setFormError("Unable to finish signing up right now. Please try again.");
    }
  }

  async function handleResendCode() {
    setFormError(null);
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setFormError("Couldn't resend the code. Please try again in a moment.");
    }
  }

  // -----------------------------------------------------------------------
  // Screen 2: email verification code
  // -----------------------------------------------------------------------
  if (pendingVerification) {
    return (
      <div className="flex flex-col gap-6">
        <Logo />
        <div>
          <h1 className="text-2xl font-semibold text-white">Check your email</h1>
          <p className="text-sm text-zinc-400 mt-1">
            We sent a 6-digit code to <span className="text-zinc-200">{emailAddress}</span>.
          </p>
        </div>

        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <AuthInput
            id="code"
            type="text"
            inputMode="numeric"
            label="Verification code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={errors?.fields?.code?.message}
            required
          />

          {formError && (
            <p className="text-sm text-red-400 text-center">{formError}</p>
          )}

          <AuthButton type="submit" loading={isLoading}>
            Verify email
          </AuthButton>

          <button
            type="button"
            onClick={handleResendCode}
            className="text-xs text-zinc-400 hover:text-white transition self-center"
          >
            Didn&apos;t get a code? Resend
          </button>
        </form>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Screen 1: email + password
  // -----------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6">
      <Logo />

      {/* Heading copy specific to sign-up */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Welcome to Omni Meet</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Your next experience starts now.
        </p>
      </div>

      <SocialButtons />

      <Divider />

      <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
        <AuthInput
          id="emailAddress"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          error={errors?.fields?.emailAddress?.message}
          required
        />

        <AuthInput
          id="username"
          type="text"
          label="Username"
          placeholder="yourname"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors?.fields?.username?.message}
          required
        />

        <AuthInput
          id="password"
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors?.fields?.password?.message}
          required
        />

        {formError && (
          <p className="text-sm text-red-400 text-center">{formError}</p>
        )}

        {/* Required DOM mount point for Clerk's bot sign-up protection.
            Safe to leave in even while you have it turned off in the
            Dashboard — it just renders nothing until re-enabled. */}
        <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="normal" />

        <AuthButton type="submit" loading={isLoading}>
          Create account
        </AuthButton>
      </form>

      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-white font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}