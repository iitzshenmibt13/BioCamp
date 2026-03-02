"use client";
import { AdminShell } from "@/components/AdminShell";
import { PointsTransactionRow } from "@/components/PointsTransactionRow";
import { MOCK_TRANSACTIONS, MOCK_CHECKINS, MOCK_INCIDENTS, MOCK_USER_ADMIN } from "@/lib/mock";
import { formatTime } from "@/lib/utils";
import Link from "next/link";
import { TrendingUp, QrCode, AlertTriangle, Gamepad2, Megaphone, Calendar } from "lucide-react";

export default function AdminHomePage() {
    const user = MOCK_USER_ADMIN;

    const QUICK = [
        { href: "/admin/game", icon: Gamepad2, label: "Game Mode", color: "bg-blue-50 text-blue-600" },
        { href: "/admin/points", icon: TrendingUp, label: "Add Points", color: "bg-green-50 text-green-600" },
        { href: "/admin/checkin", icon: QrCode, label: "Create QR", color: "bg-purple-50 text-purple-600" },
        { href: "/admin/schedule", icon: Calendar, label: "Schedule", color: "bg-amber-50 text-amber-600" },
    ];

    const recentTx = [...MOCK_TRANSACTIONS].reverse().slice(0, 5);
    const recentCheckins = [...MOCK_CHECKINS].reverse().slice(0, 3);
    const openIncidents = MOCK_INCIDENTS.filter(i => i.status !== "resolved");

    return (
        <AdminShell user={user} title="Dashboard">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {QUICK.map(({ href, icon: Icon, label, color }) => (
                    <Link key={href} href={href}
                        className="card p-4 flex flex-col items-center gap-2 hover:shadow-lifted transition-shadow">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
                            <Icon size={22} />
                        </div>
                        <span className="text-xs font-bold text-gray-700">{label}</span>
                    </Link>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Recent Transactions */}
                <div className="card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <p className="text-sm font-bold text-gray-900">Recent Points</p>
                        <Link href="/admin/points" className="text-xs text-primary font-semibold">View all →</Link>
                    </div>
                    <div className="divide-y divide-border/50 px-4">
                        {recentTx.map(tx => <PointsTransactionRow key={tx.id} tx={tx} compact />)}
                    </div>
                </div>

                {/* Incidents */}
                <div className="space-y-3">
                    {openIncidents.length > 0 && (
                        <div className="card overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <AlertTriangle size={15} className="text-warning" /> Open Incidents
                                </p>
                                <Link href="/admin/incidents" className="text-xs text-primary font-semibold">All →</Link>
                            </div>
                            {openIncidents.map(inc => (
                                <div key={inc.id} className="px-4 py-3 border-b border-border/50 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`badge text-[10px] ${inc.severity === "high" ? "bg-red-100 text-danger" : inc.severity === "medium" ? "bg-amber-100 text-warning" : "bg-gray-100 text-gray-500"}`}>
                                            {inc.severity}
                                        </span>
                                        <p className="text-xs font-semibold text-gray-700 truncate">{inc.category}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{inc.content}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recent Check-ins */}
                    <div className="card overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <QrCode size={15} className="text-primary" /> Recent Check-ins
                            </p>
                            <Link href="/admin/checkin" className="text-xs text-primary font-semibold">All →</Link>
                        </div>
                        {recentCheckins.length === 0 ? <p className="px-4 py-3 text-xs text-gray-400">No check-ins yet</p> : recentCheckins.map(ci => (
                            <div key={ci.id} className="px-4 py-3 border-b border-border/50 last:border-0 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">{ci.userName}</p>
                                    <p className="text-[10px] text-gray-400">{ci.checkpointTitle} · {formatTime(ci.checkedInAt)}</p>
                                </div>
                                {ci.pointsAwarded > 0 && <span className="badge bg-green-50 text-success text-[10px]">+{ci.pointsAwarded}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
