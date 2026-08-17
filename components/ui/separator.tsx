import * as React from "react";
import { cn } from "@/lib/utils";

function Separator({
    className,
    orientation = "horizontal",
    ...props
}: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
    return (
        <div
            data-slot="separator"
            className={cn(
                "shrink-0 bg-white/8",
                orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
                className
            )}
            {...props}
        />
    );
}

export { Separator };
