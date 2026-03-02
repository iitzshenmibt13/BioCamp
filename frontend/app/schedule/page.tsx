"use client";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { CamperLayout } from "@/components/CamperLayout";
import { TimelineItem } from "@/components/TimelineItem";
import { EmptyState } from "@/components/EmptyState";
import { MOCK_SCHEDULE, MOCK_USER_CAMPER } from "@/lib/mock";
import type { ScheduleItem } from "@/lib/types";
import { Calendar } from "lucide-react";

const TAGS = ["All", "Experiment", "Game", "Talk", "Break"];

function getItemStatus(item: ScheduleItem): "past" | "now" | "upcoming" {
    const now = Date.now();
    const start = new Date(item.startAt).getTime();
    const end = new Date(item.endAt).getTime();
    if (now > end) return "past";
    if (now >= start) return "now";
    return "upcoming";
}

export default function SchedulePage() {
    const user = MOCK_USER_CAMPER;
    const [activeTag, setActiveTag] = useState("All");
    const [search, setSearch] = useState("");

    const filtered = useMemo(() =>
        MOCK_SCHEDULE.filter(item => {
            const tagMatch = activeTag === "All" || item.tags.some(t => t.toLowerCase() === activeTag.toLowerCase());
            const searchMatch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.locationText?.toLowerCase().includes(search.toLowerCase());
            return tagMatch && searchMatch;
        }),
        [activeTag, search]);

    return (
        <CamperLayout title="Schedule" user={user} showBell noPad>
            <div className="pb-24">
                {/* Search */}
                <div className="px-4 pt-4">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search activities…" className="input pl-9 text-sm" />
                    </div>
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                    {TAGS.map(tag => (
                        <button key={tag} onClick={() => setActiveTag(tag)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeTag === tag ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                <div className="px-4">
                    {filtered.length === 0 ? (
                        <EmptyState icon={Calendar} title="No activities found" description="Try a different filter or search term." />
                    ) : (
                        <div className="card p-4">
                            {filtered.map(item => (
                                <TimelineItem key={item.id} item={item} status={getItemStatus(item)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CamperLayout>
    );
}
