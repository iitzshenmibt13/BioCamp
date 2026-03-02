import { cn, CATEGORY_ICON, CATEGORY_COLOR, formatTime } from "@/lib/utils";
import type { PointTransaction } from "@/lib/types";
import { getGroupStyle } from "@/lib/utils";

interface Props { tx: PointTransaction; compact?: boolean; }

export function PointsTransactionRow({ tx, compact }: Props) {
    const catStyle = CATEGORY_COLOR[tx.category] || { text: "#64748B", bg: "#F1F5F9" };
    const groupStyle = getGroupStyle(tx.groupName);
    const isPos = tx.deltaPoints > 0;

    return (
        <div className={cn("flex items-center gap-3 py-3 border-b border-border/50 last:border-0", tx.isReversed && "opacity-40")}>
            {/* Delta badge */}
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold",
                isPos ? "bg-green-50 text-success" : "bg-red-50 text-danger")}>
                {isPos ? "+" : ""}{tx.deltaPoints}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: groupStyle.color }} />
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{tx.groupName}</p>
                    {tx.isReversed && <span className="badge text-[10px] bg-gray-100 text-gray-500">Undone</span>}
                </div>
                {!compact && (
                    <>
                        <p className="text-xs text-gray-600 mt-0.5 truncate">{tx.reason}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">by {tx.createdByName} · {formatTime(tx.createdAt)}</p>
                    </>
                )}
            </div>

            {/* Category chip */}
            <span className="badge shrink-0" style={{ background: catStyle.bg, color: catStyle.text }}>
                {CATEGORY_ICON[tx.category]} {tx.category}
            </span>
        </div>
    );
}
