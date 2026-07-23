"use client";

import SignUpForm from "@/components/auth/SignUpForm";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
