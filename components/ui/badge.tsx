import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "border-[#332be0]/30 bg-[#332be0]/15 text-[#a5a0ff]",
                secondary: "border-white/10 bg-white/5 text-white/60",
                success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                outline: "border-white/15 text-white/70",
            },
        },
        defaultVariants: { variant: "default" },
    }
);

function Badge({
    className,
    variant,
    ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
    return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
