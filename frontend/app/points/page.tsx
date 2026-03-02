"use client";
/**
 * Points / Leaderboard page – real-time with WS, filterable by category.
 * Offline-capable: caches leaderboard in localStorage.
 */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useWebSocket } from "@/lib/ws";
import BottomNav from "@/components/BottomNav";
import AuthGate from "@/components/AuthGate";

const CACHE_KEY = "camp_leaderboard";
const CATEGORIES = ["all", "game", "homework", "attendance", "bonus", "penalty"] as const;

type LeaderboardEntry = { group_id: string; name: string; color: string; total_points: number; rank: number; last_reason?: string; last_change?: number };
type Transaction = { id: string; delta_points: number; category: string; reason: string; created_at: string; created_by_name: string; is_reversed: boolean };

export default function PointsPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [category, setCategory] = useState<string>("all");
    const [offline, setOffline] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadLeaderboard = useCallback(async () => {
        try {
            const resp = await api.get("/api/points/leaderboard");
            setLeaderboard(resp.data);
            setOffline(false);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: resp.data, ts: new Date().toISOString() }));
        } catch {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) { setLeaderboard(JSON.parse(cached).data); setOffline(true); }
        } finally { setLoading(false); }
    }, []);

    const loadTransactions = useCallback(async (groupId: string) => {
        try {
            const params = category !== "all" ? `?category=${category}` : "";
            const resp = await api.get(`/api/points/group/${groupId}/transactions${params}`);
            setTransactions(resp.data);
        } catch { }
    }, [category]);

    useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);
    useWebSocket({ points_updated: loadLeaderboard });
    useEffect(() => { if (selectedGroup) loadTransactions(selectedGroup); }, [selectedGroup, category, loadTransactions]);

    const rankIcon = (rank: number) => rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
    const categoryIcon: Record<string, string> = { game: "🎮", homework: "📝", attendance: "✅", bonus: "⭐", penalty: "❌" };

    return (
        <AuthGate>
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-400 text-white px-4 pt-10 pb-6">
                    <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
                    {offline && <p className="text-xs text-yellow-100 mt-1">⚠️ Offline – showing cached data</p>}
                </div>

                <div className="p-4 space-y-3">
                    {loading ? <p className="text-center text-gray-400 py-8">Loading...</p> : (
                        leaderboard.map((g) => (
                            <button key={g.group_id} onClick={() => setSelectedGroup(selectedGroup === g.group_id ? null : g.group_id)}
                                className={`card w-full text-left p-4 transition-all ${selectedGroup === g.group_id ? "ring-2 ring-primary-500" : ""}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`text-2xl font-black w-10 text-center ${g.rank <= 3 ? `rank-${g.rank}` : "text-gray-400"}`}>{rankIcon(g.rank)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ backgroundColor: g.color }} />
                                            <p className="font-bold text-gray-900">{g.name}</p>
                                        </div>
                                        {g.last_reason && <p className="text-xs text-gray-400 truncate mt-0.5">{g.last_reason}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black" style={{ color: g.color }}>{g.total_points.toLocaleString()}</p>
                                        {g.last_change && <p className={`text-xs font-medium ${g.last_change > 0 ? "text-green-500" : "text-red-500"}`}>{g.last_change > 0 ? "+" : ""}{g.last_change}</p>}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}

                    {/* Transactions panel */}
                    {selectedGroup && (
                        <div className="card">
                            <div className="px-4 pt-4 pb-2">
                                <p className="font-semibold text-gray-700">Transaction Log</p>
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                                    {CATEGORIES.map(c => (
                                        <button key={c} onClick={() => setCategory(c)}
                                            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${category === c ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                                            {c === "all" ? "All" : `${categoryIcon[c]} ${c}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                                {transactions.length === 0 ? (
                                    <p className="px-4 py-6 text-center text-gray-400 text-sm">No transactions.</p>
                                ) : transactions.map((tx) => (
                                    <div key={tx.id} className={`flex items-center gap-3 px-4 py-3 ${tx.is_reversed ? "opacity-40 line-through" : ""}`}>
                                        <span className="text-xl">{categoryIcon[tx.category] || "•"}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{tx.reason}</p>
                                            <p className="text-xs text-gray-400">{tx.created_by_name} · {new Date(tx.created_at).toLocaleString("zh-TW")}</p>
                                        </div>
                                        <span className={`font-bold text-sm shrink-0 ${tx.delta_points > 0 ? "text-green-600" : "text-red-500"}`}>
                                            {tx.delta_points > 0 ? "+" : ""}{tx.delta_points}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <BottomNav active="points" />
            </div>
        </AuthGate>
    );
}
