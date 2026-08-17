export function HomeSkeleton() {
    return (
        <div className="space-y-10">
            <section className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/8 sm:h-14 sm:w-14" />
                    <div className="space-y-2">
                        <div className="h-3 w-24 rounded-full bg-white/8" />
                        <div className="h-8 w-56 rounded-full bg-white/8 sm:h-10 sm:w-72" />
                    </div>
                </div>

                <div className="overflow-hidden rounded-[30px] border border-white/8 bg-white/[0.03] p-3 sm:p-4 lg:p-5">
                    <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-3 sm:p-4 lg:p-5">
                        <div className="h-[360px] rounded-[22px] bg-white/[0.06] sm:h-[420px] lg:h-[500px]" />
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-white/8" />
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-6 rounded-full bg-[#332be0]" />
                            <div className="h-2.5 w-2.5 rounded-full bg-white/12" />
                            <div className="h-2.5 w-2.5 rounded-full bg-white/12" />
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/8" />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="space-y-2">
                    <div className="h-3 w-28 rounded-full bg-white/8" />
                    <div className="h-5 w-64 rounded-full bg-white/8" />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="min-h-[144px] rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                            <div className="h-11 w-11 rounded-2xl bg-white/8" />
                            <div className="mt-6 space-y-2">
                                <div className="h-4 w-2/3 rounded-full bg-white/8" />
                                <div className="h-3 w-full rounded-full bg-white/8" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <div className="mb-4 space-y-2">
                    <div className="h-3 w-32 rounded-full bg-white/8" />
                    <div className="h-4 w-56 rounded-full bg-white/8" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4">
                            <div className="h-3 w-20 rounded-full bg-white/8" />
                            <div className="mt-4 h-8 w-16 rounded-full bg-white/8" />
                            <div className="mt-3 space-y-2">
                                <div className="h-2.5 w-full rounded-full bg-white/8" />
                                <div className="h-2.5 w-4/5 rounded-full bg-white/8" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <div className="space-y-2">
                    <div className="h-3 w-36 rounded-full bg-white/8" />
                    <div className="h-4 w-56 rounded-full bg-white/8" />
                </div>

                <div className="flex gap-2">
                    <div className="h-10 w-24 rounded-full bg-white/8" />
                    <div className="h-10 w-28 rounded-full bg-white/8" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.75fr)]">
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="h-3 w-32 rounded-full bg-white/8" />
                            <div className="h-3 w-20 rounded-full bg-white/8" />
                        </div>
                        <div className="h-[280px] rounded-2xl bg-white/[0.06]" />
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-white/8 bg-[rgba(255,255,255,0.03)] p-4 sm:p-5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="h-3 w-24 rounded-full bg-white/8" />
                                <div className="h-3 w-32 rounded-full bg-white/8" />
                            </div>
                            <div className="mx-auto h-[220px] w-full max-w-[260px] rounded-full border border-white/8 bg-white/[0.06]" />
                            <div className="mt-4 space-y-2">
                                <div className="h-3 w-24 rounded-full bg-white/8" />
                                <div className="h-3 w-20 rounded-full bg-white/8" />
                                <div className="h-3 w-28 rounded-full bg-white/8" />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                                <div className="h-3 w-20 rounded-full bg-white/8" />
                                <div className="mt-2 h-7 w-14 rounded-full bg-white/8" />
                            </div>
                            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                                <div className="h-3 w-16 rounded-full bg-white/8" />
                                <div className="mt-2 h-7 w-14 rounded-full bg-white/8" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
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
                            className="min-h-[260px] w-[min(82vw,280px)] shrink-0 rounded-[22px] border border-white/8 bg-white/[0.03] sm:w-[260px]"
                        >
                            <div className="aspect-[16/10] rounded-t-[22px] bg-white/[0.06]" />
                            <div className="space-y-3 p-4">
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

            <section className="space-y-4">
                <div className="space-y-2">
                    <div className="h-3 w-36 rounded-full bg-white/8" />
                    <div className="h-5 w-56 rounded-full bg-white/8" />
                </div>

                <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="min-h-[260px] w-[min(82vw,280px)] shrink-0 rounded-[22px] border border-white/8 bg-white/[0.03] sm:w-[260px]"
                        >
                            <div className="aspect-[16/10] rounded-t-[22px] bg-white/[0.06]" />
                            <div className="space-y-3 p-4">
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
