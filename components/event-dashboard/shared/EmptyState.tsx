export default function EmptyState({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-[14px] font-medium text-slate-700">{title}</p>
            {description && <p className="mt-1 text-[12px] text-slate-500">{description}</p>}
        </div>
    );
}
