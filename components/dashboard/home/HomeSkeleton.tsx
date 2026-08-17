type Props = {
    compact?: boolean;
};

export function HomeSkeleton({ compact = false }: Props) {
    const sectionGap = compact ? "space-y-8 lg:space-y-9" : "space-y-10";
    return (
        <div className={sectionGap}>
            <section className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className={compact ? "h-11 w-11 rounded-full bg-white/8 sm:h-12 sm:w-12" : "h-12 w-12 rounded-full bg-white/8 sm:h-14 sm:w-14"} />
                    <div className="space-y-2">
                        <div className="h-3 w-24 rounded-full bg-white/8" />
                        <div className={compact ? "h-7 w-48 rounded-full bg-white/8 sm:h-9 sm:w-64" : "h-8 w-56 rounded-full bg-white/8 sm:h-10 sm:w-72"} />
                    </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.03] p-2.5 sm:p-3 lg:p-4">
                    <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-2.5 sm:p-3 lg:p-4">
                        <div className={compact ? "h-[260px] rounded-[22px] bg-white/[0.06] sm:h-[320px] lg:h-[380px]" : "h-[360px] rounded-[22px] bg-white/[0.06] sm:h-[420px] lg:h-[500px]"} />
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                        <div className={compact ? "h-9 w-9 rounded-full bg-white/8" : "h-10 w-10 rounded-full bg-white/8"} />
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-6 rounded-full bg-[#332be0]" />
                            <div className="h-2.5 w-2.5 rounded-full bg-white/12" />
                            <div className="h-2.5 w-2.5 rounded-full bg-white/12" />
                        </div>
                        <div className={compact ? "h-9 w-9 rounded-full bg-white/8" : "h-10 w-10 rounded-full bg-white/8"} />
                    </div>
                </div>
            </section>

            <section className={compact ? "space-y-3" : "space-y-4"}>
                <div className="space-y-2">
                    <div className="h-3 w-28 rounded-full bg-white/8" />
                    <div className="h-5 w-64 rounded-full bg-white/8" />
                </div>
                <div className={compact ? "grid gap-2.5 md:grid-cols-3" : "grid gap-3 md:grid-cols-3"}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className={compact ? "min-h-[126px] rounded-[18px] border border-white/8 bg-white/[0.03] p-4" : "min-h-[144px] rounded-2xl border border-white/8 bg-white/[0.03] p-5"}>
                            <div className={compact ? "h-10 w-10 rounded-2xl bg-white/8" : "h-11 w-11 rounded-2xl bg-white/8"} />
                            <div className={compact ? "mt-5 space-y-2" : "mt-6 space-y-2"}>
                                <div className="h-4 w-2/3 rounded-full bg-white/8" />
                                <div className="h-3 w-full rounded-full bg-white/8" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className={compact ? "space-y-3" : "space-y-4"}>
                <div className="mb-4 space-y-2">
                    <div className="h-3 w-32 rounded-full bg-white/8" />
                    <div className="h-4 w-56 rounded-full bg-white/8" />
                </div>
                <div className={compact ? "grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"}>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className={compact ? "rounded-[16px] border border-white/8 bg-white/[0.03] px-3.5 py-3.5" : "rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4"}>
                            <div className="h-3 w-20 rounded-full bg-white/8" />
                            <div className={compact ? "mt-3 h-7 w-14 rounded-full bg-white/8" : "mt-4 h-8 w-16 rounded-full bg-white/8"} />
                            <div className="mt-3 space-y-2">
                                <div className="h-2.5 w-full rounded-full bg-white/8" />
                                <div className="h-2.5 w-4/5 rounded-full bg-white/8" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className={compact ? "space-y-3" : "space-y-4"}>
                <div className="space-y-2">
                    <div className="h-3 w-36 rounded-full bg-white/8" />
                    <div className="h-4 w-56 rounded-full bg-white/8" />
                </div>

                <div className="flex gap-2">
                    <div className="h-10 w-24 rounded-full bg-white/8" />
                    <div className="h-10 w-28 rounded-full bg-white/8" />
                </div>

                <div className={compact ? "grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,.75fr)]" : "grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.75fr)]"}>
                    <div className={compact ? "rounded-xl border border-white/8 bg-white/[0.03] p-3.5 sm:p-4" : "rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:p-5"}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="h-3 w-32 rounded-full bg-white/8" />
                            <div className="h-3 w-20 rounded-full bg-white/8" />
                        </div>
                        <div className={compact ? "h-[220px] rounded-2xl bg-white/[0.06]" : "h-[280px] rounded-2xl bg-white/[0.06]"} />
                    </div>

                    <div className={compact ? "space-y-3" : "space-y-4"}>
                        <div className={compact ? "rounded-xl border border-white/8 bg-[rgba(255,255,255,0.03)] p-3.5 sm:p-4" : "rounded-xl border border-white/8 bg-[rgba(255,255,255,0.03)] p-4 sm:p-5"}>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="h-3 w-24 rounded-full bg-white/8" />
                                <div className="h-3 w-32 rounded-full bg-white/8" />
                            </div>
                            <div className={compact ? "mx-auto h-[180px] w-full max-w-[220px] rounded-full border border-white/8 bg-white/[0.06]" : "mx-auto h-[220px] w-full max-w-[260px] rounded-full border border-white/8 bg-white/[0.06]"} />
                            <div className="mt-4 space-y-2">
                                <div className="h-3 w-24 rounded-full bg-white/8" />
                                <div className="h-3 w-20 rounded-full bg-white/8" />
                                <div className="h-3 w-28 rounded-full bg-white/8" />
                            </div>
                        </div>

                        <div className={compact ? "grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"}>
                            <div className={compact ? "rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5" : "rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"}>
                                <div className="h-3 w-20 rounded-full bg-white/8" />
                                <div className={compact ? "mt-2 h-6 w-12 rounded-full bg-white/8" : "mt-2 h-7 w-14 rounded-full bg-white/8"} />
                            </div>
                            <div className={compact ? "rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5" : "rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"}>
                                <div className="h-3 w-16 rounded-full bg-white/8" />
                                <div className={compact ? "mt-2 h-6 w-12 rounded-full bg-white/8" : "mt-2 h-7 w-14 rounded-full bg-white/8"} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={compact ? "space-y-3" : "space-y-4"}>
                <div className="space-y-2">
                    <div className="h-3 w-36 rounded-full bg-white/8" />
                    <div className="h-5 w-56 rounded-full bg-white/8" />
                </div>

                <div className="flex gap-2">
                    <div className="h-10 w-24 rounded-full bg-white/8" />
                    <div className="h-10 w-28 rounded-full bg-white/8" />
                </div>

                <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className={compact ? "min-h-[240px] w-[min(74vw,248px)] shrink-0 rounded-[22px] border border-white/8 bg-white/[0.03] sm:w-[236px] lg:w-[232px]" : "min-h-[260px] w-[min(82vw,280px)] shrink-0 rounded-[22px] border border-white/8 bg-white/[0.03] sm:w-[260px]"}
                        >
                            <div className="aspect-[16/10] rounded-t-[22px] bg-white/[0.06]" />
                            <div className={compact ? "space-y-3 p-3.5" : "space-y-3 p-4"}>
                                <div className="h-4 w-2/3 rounded-full bg-white/8" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full rounded-full bg-white/8" />
                                    <div className="h-3 w-5/6 rounded-full bg-white/8" />
                                </div>
                                <div className="mt-4 h-3 w-20 rounded-full bg-white/8" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className={compact ? "space-y-3" : "space-y-4"}>
                <div className="space-y-2">
                    <div className="h-3 w-36 rounded-full bg-white/8" />
                    <div className="h-5 w-56 rounded-full bg-white/8" />
                </div>

                <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className={compact ? "min-h-[240px] w-[min(74vw,248px)] shrink-0 rounded-[22px] border border-white/8 bg-white/[0.03] sm:w-[236px] lg:w-[232px]" : "min-h-[260px] w-[min(82vw,280px)] shrink-0 rounded-[22px] border border-white/8 bg-white/[0.03] sm:w-[260px]"}
                        >
                            <div className="aspect-[16/10] rounded-t-[22px] bg-white/[0.06]" />
                            <div className={compact ? "space-y-3 p-3.5" : "space-y-3 p-4"}>
                                <div className="h-4 w-2/3 rounded-full bg-white/8" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full rounded-full bg-white/8" />
                                    <div className="h-3 w-5/6 rounded-full bg-white/8" />
                                    <div className="h-3 w-4/6 rounded-full bg-white/8" />
                                </div>
                                <div className="mt-4 h-9 w-24 rounded-xl bg-white/8" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
