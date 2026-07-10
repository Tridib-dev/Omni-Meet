import AuthShell from "@/components/auth/AuthShell";

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
