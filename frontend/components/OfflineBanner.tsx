import { WifiOff } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface Props { lastUpdatedAt?: Date | string | null; }

export function OfflineBanner({ lastUpdatedAt }: Props) {
    return (
        <div className="mx-4 mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-700">
            <WifiOff size={14} className="shrink-0" />
            <p className="text-xs font-medium">
                Offline — showing cached data
                {lastUpdatedAt && <> · last updated {formatTime(lastUpdatedAt)}</>}
            </p>
        </div>
    );
}
