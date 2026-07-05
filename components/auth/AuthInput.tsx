// components/auth/ui/AuthInput.tsx
//
// Small, reusable input used by every auth form (sign-in, sign-up, forgot-password).
// Keeping this in one place means the "clean, spacious, non-cluttered" look
// stays consistent everywhere, and any styling tweak only needs to happen once.

"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  // Field-level error message coming from Clerk's `errors.fields.<name>` object
  error?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {/* Skip rendering the label entirely when it's empty — lets callers
            (e.g. the password field next to a "Forgot password?" link)
            render their own label above and just use this for the input. */}
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          // Neutral, transparent field that blends into the dark panel
          // instead of looking like a boxed default Clerk input.
          className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-white
            placeholder:text-zinc-500 outline-none transition
            focus:border-white/30 focus:bg-white/10
            ${error ? "border-red-500/60" : "border-white/10"}
            ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
