"use client";
/** Admin dashboard home page. */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

const SHORTCUTS = [
    { href: "/admin/game", label: "Game Mode", icon: "🎮", color: "from-red-500 to-orange-400", desc: "Fast scoring" },
    { href: "/admin/points", label: "Add Points", icon: "🏆", color: "from-yellow-500 to-amber-400", desc: "Transaction console" },
    { href: "/admin/schedule", label: "Schedule", icon: "📅", color: "from-primary-600 to-teal-500", desc: "Edit & publish" },
    { href: "/admin/checkin", label: "Check-in QR", icon: "✅", color: "from-indigo-600 to-blue-500", desc: "Generate QR codes" },
    { href: "/admin/homework", label: "Grade Work", icon: "📝", color: "from-purple-600 to-pink-500", desc: "Review submissions" },
    { href: "/admin/incidents", label: "Incidents", icon: "🚨", color: "from-red-700 to-rose-500", desc: "View reports" },
];

export default function AdminPage() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    useEffect(() => { api.get("/api/points/leaderboard").then(r => setLeaderboard(r.data)).catch(() => { }); }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Staff Dashboard</h1>
                <p className="text-gray-400 text-sm">Welcome back! Here's a quick overview.</p>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SHORTCUTS.map(s => (
                    <Link key={s.href} href={s.href} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white transition-opacity hover:opacity-90`}>
                        <div className="text-3xl mb-2">{s.icon}</div>
                        <p className="font-bold">{s.label}</p>
                        <p className="text-xs opacity-80 mt-0.5">{s.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Live leaderboard */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <p className="px-4 py-3 text-sm font-semibold text-gray-300 border-b border-gray-700">🏆 Live Leaderboard</p>
                {leaderboard.map(g => (
                    <div key={g.group_id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 last:border-0">
                        <span className="text-gray-400 w-8 text-center font-bold">#{g.rank}</span>
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                        <p className="flex-1 text-white font-medium">{g.name}</p>
                        <p className="font-bold text-lg" style={{ color: g.color }}>{g.total_points}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
