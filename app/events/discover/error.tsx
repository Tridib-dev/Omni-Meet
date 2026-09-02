"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function DiscoverError({ reset }: { reset: () => void }) {
    useEffect(() => {
        toast.error("Something went wrong. Try again.");
    }, []);

    return (
        <section className="discover-error-state" role="alert">
            <h1>Something went wrong</h1>
            <p>We couldn&apos;t load these results.</p>
            <button type="button" onClick={reset}>Try again</button>
        </section>
    );
}
