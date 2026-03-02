import { MapPin, ExternalLink } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ScheduleItem } from "@/lib/types";

interface Props {
    item: ScheduleItem;
    status?: "past" | "now" | "upcoming";
    compact?: boolean;
}

const STATUS_STYLES = {
    past: { dot: "bg-gray-300", text: "text-gray-400" },
    now: { dot: "bg-primary animate-pulse-soft", text: "text-gray-900" },
    upcoming: { dot: "bg-gray-200", text: "text-gray-700" },
};

const TAG_COLORS: Record<string, string> = {
    experiment: "bg-blue-50 text-blue-600",
    game: "bg-green-50 text-green-600",
    talk: "bg-purple-50 text-purple-600",
    break: "bg-amber-50 text-amber-600",
};

export function TimelineItem({ item, status = "upcoming", compact }: Props) {
    const s = STATUS_STYLES[status];
    return (
        <div className={cn("flex gap-3 py-2", status === "past" && "opacity-60")}>
            {/* Time + dot column */}
            <div className="flex flex-col items-center w-14 shrink-0">
                <span className={cn("text-[11px] font-semibold tabular-nums", s.text)}>
                    {formatTime(item.startAt)}
                </span>
                <div className="flex-1 flex flex-col items-center mt-1 gap-0.5">
                    <div className={cn("w-2 h-2 rounded-full", s.dot)} />
                    <div className="w-px flex-1 bg-border" />
                </div>
            </div>
            {/* Content */}
            <div className={cn("flex-1 pb-3 min-w-0", !compact && "")}>
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className={cn("text-[13px] font-semibold leading-snug truncate", s.text)}>{item.title}</p>
                        {item.locationText && (
                            <a href={item.mapsUrl || "#"} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 hover:text-primary transition-colors">
                                <MapPin size={10} /> {item.locationText}
                                {item.mapsUrl && <ExternalLink size={9} />}
                            </a>
                        )}
                    </div>
                    <span className="text-[10px] text-gray-400 tabular-nums shrink-0">
                        {formatTime(item.endAt)}
                    </span>
                </div>
                {!compact && item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.tags.map(t => (
                            <span key={t} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-md", TAG_COLORS[t] || "bg-gray-100 text-gray-500")}>
                                {t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
