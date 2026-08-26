"use client";

import { useEffect } from "react";

export default function EventDashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[EventDashboardError]", error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Event dashboard</p>
            <h1 className="mt-2 text-[20px] font-semibold text-slate-900">Something went wrong</h1>
            <p className="mt-2 max-w-md text-[13px] text-slate-500">
                We couldn&apos;t load this page. You may not have access, or there was a temporary error.
            </p>
            <button
                type="button"
                onClick={reset}
                className="mt-6 rounded-lg bg-[#332be0] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
                Try again
            </button>
        </div>
    );
}
