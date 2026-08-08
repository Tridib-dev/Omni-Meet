
// components/DiscoverFilteranel.tsx

'use client';

import React, { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import DiscoverDateFilter from "./DiscoverDateFilter";
import DiscoverTagFilter from "./Discovertagfilter";
import DiscoverModeFilter from "./Discovermodefilter";

// Add this mapping (same pattern as your mode filter)
const FILTER_ICON_SRC = "/icons/sliders-horizontal.svg";

const DiscoverFilterPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const searchParams = useSearchParams();

    if (searchParams.get("type") === "profiles") return null;

    return (
        <>
            <button
                type="button"
                className="discover-filter-toggle"
                onClick={() => setIsOpen(true)}
                aria-label="Open filters"
            >
                <span className="discover-filter-icon">
                    <Image 
                        src={FILTER_ICON_SRC}
                        alt="Filters"
                        width={16}
                        height={16}
                    />
                </span>
                Filters
            </button>

            {isOpen && <div className="discover-filter-backdrop" onClick={() => setIsOpen(false)} />}

            <aside className={`discover-sidebar ${isOpen ? "discover-sidebar-open" : ""}`}>
                <div className="discover-sidebar-header">
                    <p className="discover-sidebar-title">Filters</p>
                    <button
                        type="button"
                        className="discover-sidebar-close"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close filters"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M6 6L18 18M6 18L18 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                <div className="form-section">
                    <h3 className="form-section-title">Date</h3>
                    <DiscoverDateFilter />
                </div>

                <div className="form-section">
                    <h3 className="form-section-title">Mode</h3>
                    <DiscoverModeFilter />
                </div>

                <div className="form-section">
                    <h3 className="form-section-title">Tags</h3>
                    <DiscoverTagFilter />
                </div>
            </aside>
        </>
    );
};

export default DiscoverFilterPanel;
