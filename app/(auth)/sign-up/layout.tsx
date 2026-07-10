import AuthShell from "@/components/auth/AuthShell";

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell isSignUp>{children}</AuthShell>;
}
