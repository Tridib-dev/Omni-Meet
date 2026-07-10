// components/auth/ForgotPasswordForm.tsx
//
// ============================================================================
// LOGIC IS FULLY WIRED UP — UI here is intentionally minimal/placeholder.
// Style this however you like later; the 3-step state machine below does
// not need to change when you restyle it.
// ============================================================================
//
// Flow (Clerk v7 / Core 3 Future API):
//   1. Collect email -> signIn.create({ identifier }) -> signIn.resetPasswordEmailCode.sendCode()
//   2. Collect code  -> signIn.resetPasswordEmailCode.verifyCode({ code })
//   3. Collect new password -> signIn.resetPasswordEmailCode.submitPassword({ password })
//   4. If signIn.status === 'complete' -> signIn.finalize() logs the user in
// Docs: https://clerk.com/docs/guides/development/custom-flows/authentication/forgot-password

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";

export default function ForgotPasswordForm() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = fetchStatus === "fetching";

  // Step 1: send the password reset code to the user's email
  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const { error: createError } = await signIn.create({ identifier: emailAddress });
    if (createError) {
      console.error(JSON.stringify(createError, null, 2));
      setFormError("We couldn't find an account with that email.");
      return;
    }

    const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendCodeError) {
      console.error(JSON.stringify(sendCodeError, null, 2));
      setFormError("Couldn't send a reset code. Please try again.");
      return;
    }

    setCodeSent(true);
  }

  // Step 2: verify the code the user was emailed
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setFormError("That code didn't work. Please try again.");
    }
    // On success, `signIn.status` becomes 'needs_new_password' and the UI
    // below automatically shows the new-password screen.
  }

  // Step 3: submit the new password
  async function submitNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      // Optional: log the user out everywhere else once they reset their password
      signOutOfOtherSessions: true,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setFormError(error.longMessage ?? "Couldn't set your new password.");
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
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
    } else if (signIn.status === "needs_second_factor") {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
      setFormError("Two-factor authentication is required for this account.");
    } else {
      console.error("Sign-in attempt not complete:", signIn);
      setFormError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6 text-white">
      <h1 className="text-2xl font-semibold">Forgot password?</h1>

      {/* Step 1 UI: collect email — placeholder styling, restyle freely */}
      {!codeSent && (
        <form onSubmit={sendCode} className="flex flex-col gap-3">
          <label htmlFor="emailAddress" className="text-sm text-zinc-300">
            Email address
          </label>
          <input
            id="emailAddress"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none"
            required
          />
          {errors?.fields?.identifier && (
            <p className="text-xs text-red-400">{errors.fields.identifier.message}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-white text-zinc-900 font-medium py-2.5 disabled:opacity-60"
          >
            {isLoading ? "Sending..." : "Send password reset code"}
          </button>
        </form>
      )}

      {/* Step 2 UI: collect the code */}
      {codeSent && signIn.status !== "needs_new_password" && (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          <label htmlFor="code" className="text-sm text-zinc-300">
            Enter the code sent to your email
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none"
            required
          />
          {errors?.fields?.code && (
            <p className="text-xs text-red-400">{errors.fields.code.message}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-white text-zinc-900 font-medium py-2.5 disabled:opacity-60"
          >
            {isLoading ? "Verifying..." : "Verify code"}
          </button>
        </form>
      )}

      {/* Step 3 UI: collect new password */}
      {signIn.status === "needs_new_password" && (
        <form onSubmit={submitNewPassword} className="flex flex-col gap-3">
          <label htmlFor="password" className="text-sm text-zinc-300">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none"
            required
          />
          {errors?.fields?.password && (
            <p className="text-xs text-red-400">{errors.fields.password.message}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-white text-zinc-900 font-medium py-2.5 disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Set new password"}
          </button>
        </form>
      )}

      {formError && <p className="text-sm text-red-400 text-center">{formError}</p>}

      <p className="text-center text-sm text-zinc-400">
        Remember your password?{" "}
        <Link href="/sign-in" className="text-white font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
