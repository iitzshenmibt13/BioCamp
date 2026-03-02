"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useWebSocket } from "@/lib/ws";
import BottomNav from "@/components/BottomNav";
import AuthGate from "@/components/AuthGate";

type Announcement = { id: string; title: string; content: string; is_pinned: boolean; target: string; created_at: string };

export default function AnnouncementsPage() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);

    const load = useCallback(async () => {
        try { const r = await api.get("/api/announcements"); setItems(r.data); } catch { }
    }, []);

    useEffect(() => { load(); }, [load]);
    useWebSocket({ announcement_created: load });

    return (
        <AuthGate>
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-gradient-to-br from-rose-600 to-pink-500 text-white px-4 pt-10 pb-6">
                    <h1 className="text-2xl font-bold">📢 Announcements</h1>
                </div>
                <div className="p-4 space-y-3">
                    {items.length === 0 && <p className="text-center text-gray-400 py-8">No announcements.</p>}
                    {items.map(a => (
                        <button key={a.id} className="card w-full text-left p-4" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                            <div className="flex items-start gap-3">
                                {a.is_pinned && <span className="text-lg shrink-0">📌</span>}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{a.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(a.created_at).toLocaleDateString("zh-TW")}</p>
                                    {expanded === a.id && <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.content}</p>}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <BottomNav active="announcements" />
            </div>
        </AuthGate>
    );
}
