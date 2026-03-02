"use client";
/**
 * Today's Schedule – "Now & Next" + full day timeline.
 * Offline-capable: data is cached in localStorage.
 */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { exchangeAndStoreToken } from "@/lib/auth";
import { useWebSocket } from "@/lib/ws";
import { formatDistanceToNow, isAfter, isBefore } from "date-fns";
import { toZonedTime, format } from "date-fns-tz";
import BottomNav from "@/components/BottomNav";
import AuthGate from "@/components/AuthGate";

const TZ = "Asia/Taipei";
const CACHE_KEY = "camp_schedule_today";

type ScheduleItem = {
    id: string; title: string; description?: string;
    start_at: string; end_at: string;
    location_text?: string; maps_url?: string; is_published: boolean;
};

function getNowAndNext(items: ScheduleItem[]) {
    const now = new Date();
    const ongoing = items.filter(i => isBefore(new Date(i.start_at), now) && isAfter(new Date(i.end_at), now));
    const upcoming = items.filter(i => isAfter(new Date(i.start_at), now)).sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
    return { current: ongoing[0] || null, next: upcoming[0] || null };
}

export default function ScheduleTodayPage() {
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [offline, setOffline] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const today = new Date();
            const from = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            const to = new Date(today.setHours(23, 59, 59, 999)).toISOString();
            const resp = await api.get(`/api/schedule?from=${from}&to=${to}`);
            setItems(resp.data);
            setOffline(false);
            const stored = { data: resp.data, ts: new Date().toISOString() };
            localStorage.setItem(CACHE_KEY, JSON.stringify(stored));
            setLastUpdated(new Date().toLocaleTimeString("zh-TW"));
        } catch {
            // Offline – load cache
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, ts } = JSON.parse(cached);
                setItems(data);
                setOffline(true);
                setLastUpdated(new Date(ts).toLocaleString("zh-TW"));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);
    useWebSocket({ schedule_updated: load });

    const { current, next } = getNowAndNext(items);
    const allToday = items.slice().sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

    return (
        <AuthGate>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-br from-primary-700 to-primary-500 text-white px-4 pt-10 pb-6">
                    <h1 className="text-2xl font-bold">📅 Today</h1>
                    <p className="text-primary-100 text-sm mt-1">
                        {new Date().toLocaleDateString("zh-TW", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    {offline && <p className="text-xs text-yellow-200 mt-1">⚠️ Offline – cached at {lastUpdated}</p>}
                </div>

                <div className="p-4 space-y-4">
                    {/* NOW card */}
                    {current && (
                        <div className="card border-l-4 border-l-green-500 p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 pulse-green inline-block" />
                                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Happening Now</span>
                            </div>
                            <p className="font-bold text-lg text-gray-900">{current.title}</p>
                            {current.location_text && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                    📍 {current.location_text}
                                    {current.maps_url && <a href={current.maps_url} target="_blank" rel="noreferrer" className="ml-2 text-primary-600 underline text-xs">Open Maps</a>}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                                Ends {formatDistanceToNow(new Date(current.end_at), { addSuffix: true })}
                            </p>
                        </div>
                    )}

                    {/* NEXT card */}
                    {next && (
                        <div className="card border-l-4 border-l-blue-400 p-4">
                            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Up Next</span>
                            <p className="font-bold text-gray-900 mt-1">{next.title}</p>
                            <p className="text-sm text-gray-500">
                                🕐 {format(toZonedTime(new Date(next.start_at), TZ), "HH:mm", { timeZone: TZ })}
                                {next.location_text && ` · ${next.location_text}`}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {formatDistanceToNow(new Date(next.start_at), { addSuffix: true })}
                            </p>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="card divide-y divide-gray-50">
                        <p className="px-4 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Full Schedule</p>
                        {loading ? (
                            <p className="px-4 py-6 text-center text-gray-400 text-sm">Loading...</p>
                        ) : allToday.length === 0 ? (
                            <p className="px-4 py-6 text-center text-gray-400 text-sm">No schedule items for today.</p>
                        ) : allToday.map((item) => {
                            const isPast = isBefore(new Date(item.end_at), new Date());
                            const isNow = current?.id === item.id;
                            return (
                                <div key={item.id} className={`flex gap-3 px-4 py-3 ${isPast ? "opacity-50" : ""} ${isNow ? "bg-green-50" : ""}`}>
                                    <div className="w-14 shrink-0 text-sm font-medium text-gray-500">
                                        {format(toZonedTime(new Date(item.start_at), TZ), "HH:mm", { timeZone: TZ })}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-sm ${isNow ? "text-primary-700" : "text-gray-800"}`}>{item.title}</p>
                                        {item.location_text && (
                                            <p className="text-xs text-gray-400 truncate">
                                                📍 {item.location_text}
                                                {item.maps_url && <a href={item.maps_url} target="_blank" rel="noreferrer" className="ml-1 text-primary-500 underline">Map</a>}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <BottomNav active="schedule" />
            </div>
        </AuthGate>
    );
}
