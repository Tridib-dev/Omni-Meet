import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0C10] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15">
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-red-300" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 9v3" strokeLinecap="round" />
            <path d="M12 16h.01" strokeLinecap="round" />
            <path d="M10.29 3.86l-7.42 12.88A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.73-3.26L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-red-300/80">Access denied</p>
        <h1 className="mt-3 text-3xl font-semibold">You don&apos;t have access to this page.</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          This event gate is reserved for the creator or a co-organizer.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0A0C10]"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
