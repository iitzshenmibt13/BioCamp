import { cn } from "@/lib/utils";

export function SkeletonBox({ className }: { className?: string }) {
    return <div className={cn("skeleton", className)} />;
}

export function SkeletonCard() {
    return (
        <div className="card p-4 space-y-3">
            <div className="flex items-center gap-3">
                <SkeletonBox className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-4 w-2/3" />
                    <SkeletonBox className="h-3 w-1/3" />
                </div>
            </div>
            <SkeletonBox className="h-3 w-full" />
            <SkeletonBox className="h-3 w-4/5" />
        </div>
    );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card p-4 flex items-center gap-3">
                    <SkeletonBox className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <SkeletonBox className="h-4 w-3/4" />
                        <SkeletonBox className="h-3 w-1/2" />
                    </div>
                    <SkeletonBox className="h-6 w-12 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonBox key={i} className="h-3" style={{ width: i === lines - 1 ? "60%" : "100%" } as any} />
            ))}
        </div>
    );
}
