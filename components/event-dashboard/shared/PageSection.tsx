import { cn } from "@/lib/utils";

export default function PageSection({
    title,
    description,
    action,
    children,
    className,
    headerClassName,
    descriptionClassName,
    titleClassName,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    headerClassName?: string;
    descriptionClassName?: string;
    titleClassName?: string;
}) {
    return (
        <section className={cn("space-y-6", children && "pb-8", className)}>
            <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", headerClassName)}>
                <div className="min-w-0">
                    <h2 className={cn("text-[18px] font-semibold text-slate-900", titleClassName)}>
                        {title}
                    </h2>
                    {description && (
                        <p className={cn("mt-1 max-w-2xl text-[13px] text-slate-500", descriptionClassName)}>
                            {description}
                        </p>
                    )}
                </div>
                {action && <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">{action}</div>}
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}
