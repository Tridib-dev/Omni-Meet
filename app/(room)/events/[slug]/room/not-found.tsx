import Link from "next/link";

export default function RoomNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0C10] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Room missing</p>
        <h1 className="mt-3 text-3xl font-semibold">We couldn&apos;t find that room.</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          The room may not be configured yet or the link may be invalid.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#0A0C10]"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
