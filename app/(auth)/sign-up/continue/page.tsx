// app/(auth)/sign-up/continue/page.tsx
//
// The /sso-callback page sends users here ONLY when an OAuth sign-in got
// transferred into a sign-up and Clerk still needs more info to finish it
// (status === 'missing_requirements') — e.g. your Dashboard requires a
// username or first/last name that the OAuth provider didn't supply.
//
// If your Dashboard's sign-up requirements are just email + password,
// this page will likely never be hit — but it needs to exist so the
// redirect doesn't 404 if it ever is.
// Docs: https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections#handle-missing-requirements

"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";

import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

function ContinueSignUpForm() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = fetchStatus === "fetching";

  // NOTE: there used to be a render-time check here
  // (`if (signUp.status === "complete") router.push("/")`) meant as a
  // safety net. It caused two bugs at once:
  //   1. Calling router.push() during render violates React's rules
  //      ("Cannot update a component while rendering a different component").
  //   2. It navigated home WITHOUT calling signUp.finalize() first — so no
  //      session was ever actually created. That's why you landed on "/"
  //      unauthenticated.
  // handleSubmit() below already calls signUp.finalize() (which creates the
  // session) whenever status becomes "complete", so that's the only place
  // this should ever happen.

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    // Adjust these fields to match whatever your Dashboard actually
    // requires (phone, legal acceptance, etc.)
    const { error } = await signUp.update({ firstName, lastName, username });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setFormError(error.longMessage ?? "Couldn't save that. Please try again.");
      return;
    }

    if (signUp.status === "complete") {
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
    } else if (signUp.status === "missing_requirements") {
      // We supplied firstName/lastName but something ELSE is still
      // required — e.g. your Clerk Dashboard also requires a username,
      // phone number, or "legal accepted" checkbox. This is the case that
      // was previously silently doing nothing.
      console.log("Still missing:", signUp.missingFields);
      console.log("Still unverified:", signUp.unverifiedFields);
      setFormError(
        signUp.missingFields?.length
          ? `We still need: ${signUp.missingFields.join(", ")}. Check your Clerk Dashboard's sign-up requirements and add matching fields to this form.`
          : "Something else is required to finish signing up — check the browser console for details."
      );
    } else {
      console.error("Sign-up attempt not complete:", signUp.status);
      setFormError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6 text-white">
      <h1 className="text-2xl font-semibold">Just one more step</h1>
      <p className="text-sm text-zinc-400">We need a couple more details to finish setting up your account.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          id="firstName"
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors?.fields?.firstName?.message}
          required
        />
        <AuthInput
          id="lastName"
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errors?.fields?.lastName?.message}
          required
        />
        <AuthInput
          id="username"
          label="Username"
          placeholder="yourname"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors?.fields?.username?.message}
          required
        />

        {formError && <p className="text-sm text-red-400 text-center">{formError}</p>}

        <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="normal" />

        <AuthButton type="submit" loading={isLoading}>
          Continue
        </AuthButton>
      </form>
    </div>
  );
}

export default function ContinueSignUpPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <ContinueSignUpForm />
    </Suspense>
  );
}
