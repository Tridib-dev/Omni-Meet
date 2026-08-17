export function HomeSkeleton() {
    return (
        <div className="space-y-8">
            <section className="rounded-[28px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/8 sm:h-14 sm:w-14" />
                    <div className="space-y-2">
                        <div className="h-3 w-24 rounded-full bg-white/8" />
                        <div className="h-8 w-56 rounded-full bg-white/8 sm:h-10 sm:w-72" />
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <div className="flex items-end justify-between gap-4">
                        <div className="space-y-2">
                            <div className="h-3 w-32 rounded-full bg-white/8" />
                            <div className="h-5 w-64 rounded-full bg-white/8" />
                        </div>
                        <div className="hidden h-3 w-52 rounded-full bg-white/8 sm:block" />
                    </div>

                    <div className="grid grid-flow-col auto-cols-[minmax(260px,86vw)] gap-4 overflow-hidden sm:auto-cols-[minmax(320px,60vw)] lg:auto-cols-[minmax(360px,32vw)]">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-[390px] rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                                <div className="h-[240px] rounded-[22px] bg-white/8" />
                                <div className="mt-4 space-y-3">
                                    <div className="h-3 w-24 rounded-full bg-white/8" />
                                    <div className="h-7 w-5/6 rounded-full bg-white/8" />
                                    <div className="h-3 w-2/3 rounded-full bg-white/8" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-2">
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
        </div>
    );
}
