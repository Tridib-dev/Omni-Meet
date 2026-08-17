export default function PageSection({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
}) {
    return (
        <section className={children ? "space-y-4" : undefined}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/25">
                        Section
                    </p>
                    <h2 className="mt-1 text-[18px] font-semibold text-white/90">{title}</h2>
                    {description && (
                        <p className="mt-1 max-w-2xl text-[13px] text-white/40">{description}</p>
                    )}
                </div>
                {action && <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">{action}</div>}
            </div>
            {children}
        </section>
    );
}
