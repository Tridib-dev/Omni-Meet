"use client";

import SignInForm from "@/components/auth/SignInForm";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
