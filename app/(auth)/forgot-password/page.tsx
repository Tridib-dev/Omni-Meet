// app/(auth)/forgot-password/page.tsx
//
// Renders the forgot-password flow. Logic is fully implemented in
// ForgotPasswordForm.tsx — restyle that component whenever you're ready,
// the state machine (send code -> verify code -> set new password)
// won't need to change.
//
// NOTE: Wrapped in <Suspense> — see the comment in sign-in/page.tsx for why.

import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}