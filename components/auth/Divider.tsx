// components/auth/ui/Divider.tsx
//
// "or continue with" separator between the email/password form and
// the social login row.

export default function Divider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
