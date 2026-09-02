'use client';


// components/DiscoverSearchBar.tsx

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DiscoverSearchBar = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [q, setQ] = useState(searchParams.get("q") ?? "");
    const [location, setLocation] = useState(searchParams.get("location") ?? "");
    const activeType = searchParams.get("type") === "profiles" ? "profiles" : "events";

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const params = new URLSearchParams(searchParams.toString());
        if (q.trim()) {
            params.set("q", q.trim());
        } else {
            params.delete("q");
        }
        if (activeType === "events") {
            if (location.trim()) {
                params.set("location", location.trim());
            } else {
                params.delete("location");
            }
        } else {
            params.delete("location");
        }
        params.delete("page");

        router.push(`/events/discover?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="discover-search-row">
            <div className="discover-search-box discover-search-query">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="discover-search-icon">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={activeType === "profiles" ? "Search people, usernames, interests..." : "Search events, tags, topics..."}
                    aria-label={activeType === "profiles" ? "Search profiles" : "Search events"}
                />
            </div>

            {activeType === "events" && (
                <div className="discover-search-box discover-search-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="discover-search-icon">
                        <path
                            d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, state, or country"
                        aria-label="Location"
                    />
                </div>
            )}

            <button type="submit" className="discover-search-button" aria-label="Search">Search</button>
        </form>
    );
};

export default DiscoverSearchBar;
