"use client";
import Link from "next/link";
import { Bell, FlaskConical } from "lucide-react";
import { GroupBadge } from "./GroupBadge";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

interface Props {
    title: string;
    user?: User | null;
    showBell?: boolean;
    className?: string;
}

export function AppHeader({ title, user, showBell, className }: Props) {
    return (
        <header className={cn("sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-border/60 px-4 h-14 flex items-center justify-between", className)}>
            {/* Left: logo + title */}
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
                    <FlaskConical size={15} className="text-white" />
                </div>
                <h1 className="text-[15px] font-bold text-gray-900 truncate">{title}</h1>
            </div>
            {/* Right: group badge + bell */}
            <div className="flex items-center gap-2 shrink-0">
                {user?.groupName && <GroupBadge name={user.groupName} color={user.groupColor || "#3B82F6"} size="sm" />}
                {showBell && (
                    <Link href="/announcements" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors" aria-label="Announcements">
                        <Bell size={18} className="text-gray-600" />
                    </Link>
                )}
            </div>
        </header>
    );
}
