import { Trophy } from "lucide-react";
import { cn, getGroupStyle } from "@/lib/utils";
import type { Group } from "@/lib/types";

interface Props {
    group: Group;
    rank: number;
    isMyGroup?: boolean;
}

const RANK_STYLES: Record<number, { icon: string; badge: string }> = {
    1: { icon: "🥇", badge: "bg-amber-50 border-amber-200 text-amber-700" },
    2: { icon: "🥈", badge: "bg-gray-50 border-gray-200 text-gray-600" },
    3: { icon: "🥉", badge: "bg-orange-50 border-orange-200 text-orange-600" },
};

export function LeaderboardRow({ group, rank, isMyGroup }: Props) {
    const style = getGroupStyle(group.name);
    const rankStyle = RANK_STYLES[rank];

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors",
            isMyGroup ? "ring-2 ring-offset-1" : "hover:bg-gray-50",
        )} style={isMyGroup ? { ringColor: style.color, background: style.bg + "60" } : {}}>
            {/* Rank */}
            <div className="w-8 text-center shrink-0">
                {rankStyle ? (
                    <span className="text-xl">{rankStyle.icon}</span>
                ) : (
                    <span className="text-sm font-bold text-gray-400 tabular-nums">#{rank}</span>
                )}
            </div>

            {/* Group info */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: style.color }} />
                <div className="min-w-0">
                    <p className={cn("text-[13px] font-bold truncate", isMyGroup ? "text-gray-900" : "text-gray-800")}>
                        {group.name}
                    </p>
                    {isMyGroup && <p className="text-[10px] text-primary font-medium">Your group</p>}
                </div>
            </div>

            {/* Points */}
            <div className="text-right shrink-0">
                <p className="text-[15px] font-bold text-gray-900 tabular-nums">{group.totalPoints.toLocaleString()}</p>
                {group.todayPoints !== undefined && (
                    <p className="text-[10px] text-success font-medium">+{group.todayPoints} today</p>
                )}
            </div>
        </div>
    );
}
