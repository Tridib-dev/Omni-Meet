import { cn } from "@/lib/utils";

export default function PageSection({
    title,
    description,
    action,
    children,
    className,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={cn("space-y-6", children && "pb-8", className)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-[18px] font-semibold text-white/90">{title}</h2>
                    {description && (
                        <p className="mt-1 max-w-2xl text-[13px] text-white/40">{description}</p>
                    )}
                </div>
                {action && <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">{action}</div>}
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}
