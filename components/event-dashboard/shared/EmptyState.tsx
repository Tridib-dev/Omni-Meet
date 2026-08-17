export default function EmptyState({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-[14px] font-medium text-white/55">{title}</p>
            {description && <p className="mt-1 text-[12px] text-white/30">{description}</p>}
        </div>
    );
}
