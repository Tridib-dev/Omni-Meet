import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card"
            className={cn(
                "rounded-xl border border-white/8 bg-white/[0.03] text-white shadow-sm transition-colors",
                className
            )}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="card-header" className={cn("flex flex-col gap-1.5 p-4 sm:p-5", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
    return (
        <h3
            data-slot="card-title"
            className={cn("text-base font-semibold leading-none tracking-tight text-white/90", className)}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
    return (
        <p data-slot="card-description" className={cn("text-sm text-white/45", className)} {...props} />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="card-content" className={cn("p-4 pt-0 sm:p-5 sm:pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div data-slot="card-footer" className={cn("flex items-center p-4 pt-0 sm:p-5 sm:pt-0", className)} {...props} />
    );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
