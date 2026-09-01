
// components/DiscoverFilteranel.tsx

'use client';

import React, { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import DiscoverDateFilter from "./DiscoverDateFilter";
import DiscoverTagFilter from "./Discovertagfilter";
import DiscoverModeFilter from "./Discovermodefilter";
import DiscoverCategoryFilter from "./DiscoverCategoryFilter";
import HorizontalScrollProgress from "@/components/event-dashboard/shared/HorizontalScrollProgress";

// Add this mapping (same pattern as your mode filter)
const FILTER_ICON_SRC = "/icons/sliders-horizontal.svg";

const DiscoverFilterPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [tagQuery, setTagQuery] = useState("");
    const [categoryQuery, setCategoryQuery] = useState("");
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
                        <X size={18} />
                    </button>
                </div>

                <HorizontalScrollProgress orientation="vertical" showOnlyWhileScrolling className="discover-filter-scroll" contentClassName="discover-filter-scroll-viewport">
                    <div className="discover-filter-content">
                        <section className="discover-filter-section">
                            <h3 className="discover-filter-section-title">Date</h3>
                            <DiscoverDateFilter />
                        </section>
                        <section className="discover-filter-section">
                            <h3 className="discover-filter-section-title">Mode</h3>
                            <DiscoverModeFilter />
                        </section>
                        <section className="discover-filter-section">
                            <div className="discover-filter-section-heading"><h3 className="discover-filter-section-title">Categories</h3><label className="discover-filter-search"><Search size={13} /><input value={categoryQuery} onChange={(event) => setCategoryQuery(event.target.value)} placeholder="Find" aria-label="Search categories" /></label></div>
                            <DiscoverCategoryFilter searchQuery={categoryQuery} />
                        </section>
                        <section className="discover-filter-section">
                            <div className="discover-filter-section-heading"><h3 className="discover-filter-section-title">Tags</h3><label className="discover-filter-search"><Search size={13} /><input value={tagQuery} onChange={(event) => setTagQuery(event.target.value)} placeholder="Find" aria-label="Search tags" /></label></div>
                            <DiscoverTagFilter searchQuery={tagQuery} />
                        </section>
                    </div>
                </HorizontalScrollProgress>
            </aside>
        </>
    );
};

export default DiscoverFilterPanel;
