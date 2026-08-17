import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-3 py-6">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-10 w-80 max-w-full" />
                <Skeleton className="h-20 w-full max-w-xl rounded-xl" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Skeleton className="h-[112px] rounded-xl" />
                <Skeleton className="h-[112px] rounded-xl" />
                <Skeleton className="h-[112px] rounded-xl" />
            </div>
            <Skeleton className="h-[320px] rounded-xl" />
        </div>
    );
}
