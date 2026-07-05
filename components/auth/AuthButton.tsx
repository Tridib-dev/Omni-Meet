// components/auth/ui/AuthButton.tsx
//
// Shared primary button for auth forms. Handles the loading spinner state
// so every form doesn't need to reimplement it.

"use client";

import { ButtonHTMLAttributes } from "react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function AuthButton({
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: AuthButtonProps) {
  return (
    <button
      // Disable while a request is in flight (fetchStatus === 'fetching')
      // or when the caller explicitly disables it.
      disabled={disabled || loading}
      className={`relative w-full rounded-xl bg-white text-zinc-900 font-medium py-2.5
        transition disabled:opacity-60 disabled:cursor-not-allowed
        hover:bg-zinc-200 ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          {/* Simple inline spinner, no external icon dependency needed */}
          <svg
            className="h-4 w-4 animate-spin text-zinc-900"
            viewBox="0 0 24 24"
            fill="none"
          >
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
          Please wait...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
