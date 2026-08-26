import Link from "next/link";

export default function EventDashboardNotFound() {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Event dashboard</p>
            <h1 className="mt-2 text-[20px] font-semibold text-slate-900">Event not found</h1>
            <p className="mt-2 max-w-md text-[13px] text-slate-500">
                This event doesn&apos;t exist, or you don&apos;t have permission to manage it.
            </p>
            <Link
                href="/dashboard/organized"
                className="mt-6 rounded-lg bg-[#332be0] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
                Back to My Events
            </Link>
        </div>
    );
}
