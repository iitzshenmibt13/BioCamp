import { Pin, Megaphone } from "lucide-react";
import { formatRelative, cn } from "@/lib/utils";
import Link from "next/link";
import type { Announcement } from "@/lib/types";

interface Props { ann: Announcement; preview?: boolean; }

export function AnnouncementCard({ ann, preview }: Props) {
    return (
        <Link href={`/announcements/${ann.id}`}
            className={cn("card p-4 block hover:shadow-lifted transition-shadow", ann.isPinned && "border-primary/30 bg-primary-soft/30")}>
            <div className="flex items-start gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    ann.isPinned ? "bg-primary text-white" : "bg-gray-100 text-gray-500")}>
                    {ann.isPinned ? <Pin size={16} /> : <Megaphone size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-[13px] font-bold text-gray-900 leading-snug">{ann.title}</p>
                        {ann.isPinned && <span className="badge bg-primary text-white text-[9px] shrink-0">PINNED</span>}
                    </div>
                    {preview ? (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{ann.content}</p>
                    ) : null}
                    <p className="text-[10px] text-gray-400 mt-1.5">{ann.createdByName} · {formatRelative(ann.createdAt)}</p>
                </div>
            </div>
        </Link>
    );
}
