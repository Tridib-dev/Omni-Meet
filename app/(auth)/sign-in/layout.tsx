import AuthShell from "@/components/auth/AuthShell";

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
