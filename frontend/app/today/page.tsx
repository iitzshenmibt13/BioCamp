"use client";
import { useMemo } from "react";
import { MapPin, ExternalLink, QrCode, TrendingUp, ClipboardList, Megaphone, Camera } from "lucide-react";
import Link from "next/link";
import { CamperLayout } from "@/components/CamperLayout";
import { TimelineItem } from "@/components/TimelineItem";
import { PhotoStrip } from "@/components/PhotoStrip";
import { MOCK_SCHEDULE, MOCK_PHOTOS, MOCK_USER_CAMPER } from "@/lib/mock";
import { formatTime, getProgress } from "@/lib/utils";
import type { ScheduleItem } from "@/lib/types";

function getItemStatus(item: ScheduleItem): "past" | "now" | "upcoming" {
    const now = Date.now();
    const start = new Date(item.startAt).getTime();
    const end = new Date(item.endAt).getTime();
    if (now > end) return "past";
    if (now >= start) return "now";
    return "upcoming";
}

export default function TodayPage() {
    const user = MOCK_USER_CAMPER; // swap with useSession()

    const { nowItem, nextItem } = useMemo(() => {
        let nowItem: ScheduleItem | null = null;
        let nextItem: ScheduleItem | null = null;
        const now = Date.now();
        for (const item of MOCK_SCHEDULE) {
            const start = new Date(item.startAt).getTime();
            const end = new Date(item.endAt).getTime();
            if (now >= start && now < end) { nowItem = item; continue; }
            if (now < start && !nextItem) { nextItem = item; }
        }
        return { nowItem, nextItem };
    }, []);

    const minutesUntilNext = nextItem
        ? Math.round((new Date(nextItem.startAt).getTime() - Date.now()) / 60000)
        : null;

    return (
        <CamperLayout title="Today" user={user} showBell noPad>
            <div className="space-y-4 px-4 pt-4 pb-28">

                {/* ── NOW CARD ── */}
                {nowItem ? (
                    <div className="rounded-3xl p-5 text-white relative overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 60%, #60A5FA 100%)" }}>
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)" }} />
                        <div className="relative">
                            <span className="badge bg-white/25 text-white text-[10px] tracking-widest uppercase mb-3 inline-flex">🔴 Now</span>
                            <h2 className="text-xl font-bold leading-tight mb-1">{nowItem.title}</h2>
                            <p className="text-blue-100 text-sm mb-1">
                                {formatTime(nowItem.startAt)} – {formatTime(nowItem.endAt)}
                            </p>
                            {nowItem.locationText && (
                                <a href={nowItem.mapsUrl || "#"} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-100 text-xs hover:text-white mb-4">
                                    <MapPin size={11} /> {nowItem.locationText}
                                    {nowItem.mapsUrl && <ExternalLink size={10} />}
                                </a>
                            )}
                            {/* Progress bar */}
                            <div className="mt-3 mb-4">
                                <div className="h-1.5 rounded-full bg-white/25 overflow-hidden">
                                    <div className="h-full rounded-full bg-white transition-all"
                                        style={{ width: `${getProgress(nowItem.startAt, nowItem.endAt)}%` }} />
                                </div>
                                <p className="text-[11px] text-blue-100 mt-1">{getProgress(nowItem.startAt, nowItem.endAt)}% complete</p>
                            </div>
                            {/* Check-in button */}
                            {nowItem.hasCheckin && (
                                <Link href="/checkin"
                                    className="inline-flex items-center gap-2 bg-white text-primary rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-blue-50 transition-colors">
                                    <QrCode size={16} /> Scan QR Check-in
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="card p-5 text-center">
                        <p className="text-gray-500 text-sm">No session in progress right now</p>
                    </div>
                )}

                {/* ── NEXT CARD ── */}
                {nextItem && (
                    <div className="card p-4 flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-lg">⏭️</div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                                Next{minutesUntilNext !== null ? ` · in ${minutesUntilNext}m` : ""}
                            </p>
                            <p className="text-[14px] font-bold text-gray-900 mt-0.5">{nextItem.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formatTime(nextItem.startAt)} – {formatTime(nextItem.endAt)}
                                {nextItem.locationText && ` · ${nextItem.locationText}`}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── QUICK ACTIONS ── */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { href: "/points", icon: TrendingUp, label: "Leaderboard", color: "bg-blue-50 text-blue-600" },
                        { href: "/homework", icon: ClipboardList, label: "Homework", color: "bg-purple-50 text-purple-600" },
                        { href: "/announcements", icon: Megaphone, label: "Updates", color: "bg-amber-50 text-amber-600" },
                    ].map(({ href, icon: Icon, label, color }) => (
                        <Link key={href} href={href}
                            className="card flex flex-col items-center py-3 gap-1.5 hover:shadow-lifted transition-shadow">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                                <Icon size={18} />
                            </div>
                            <span className="text-[11px] font-semibold text-gray-700">{label}</span>
                        </Link>
                    ))}
                </div>

                {/* ── TODAY TIMELINE ── */}
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-gray-900">Today's Schedule</p>
                        <Link href="/schedule" className="text-xs text-primary font-semibold">Full schedule →</Link>
                    </div>
                    <div className="divide-y divide-border/40">
                        {MOCK_SCHEDULE.map(item => (
                            <TimelineItem key={item.id} item={item} status={getItemStatus(item)} compact />
                        ))}
                    </div>
                </div>

                {/* ── ACTIVITY PHOTOS ── */}
                {MOCK_PHOTOS.filter(p => p.isPublished).length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Camera size={16} className="text-gray-500" />
                            <p className="text-sm font-bold text-gray-900">Activity Photos</p>
                        </div>
                        <PhotoStrip photos={MOCK_PHOTOS} />
                    </div>
                )}

            </div>
        </CamperLayout>
    );
}
