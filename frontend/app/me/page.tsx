"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import AuthGate from "@/components/AuthGate";
import Link from "next/link";

export default function MePage() {
    const user = getStoredUser();
    const [checkins, setCheckins] = useState<any[]>([]);
    const [groupName, setGroupName] = useState<string | null>(null);

    useEffect(() => {
        api.get("/api/checkin/history").then(r => setCheckins(r.data)).catch(() => { });
        if (user?.group_id) {
            api.get("/api/groups").then(r => {
                const g = r.data.find((g: any) => g.id === user.group_id);
                if (g) setGroupName(g.name);
            }).catch(() => { });
        }
    }, []);

    const isStaff = user?.role === "staff" || user?.role === "admin";

    return (
        <AuthGate>
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-gradient-to-br from-gray-700 to-gray-500 text-white px-4 pt-10 pb-6">
                    <div className="flex items-center gap-4">
                        {user?.picture_url ? (
                            <img src={user.picture_url} alt="avatar" className="w-16 h-16 rounded-full border-2 border-white object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-primary-400 flex items-center justify-center text-2xl">👤</div>
                        )}
                        <div>
                            <p className="text-xl font-bold">{user?.display_name || "Camper"}</p>
                            <p className="text-gray-300 text-sm capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <div className="card p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Group</p>
                        {groupName ? (
                            <p className="font-bold text-lg text-gray-800">{groupName}</p>
                        ) : (
                            <p className="text-gray-400 text-sm">Not assigned to a group yet.</p>
                        )}
                    </div>

                    {/* Quick links */}
                    <div className="card divide-y divide-gray-50">
                        <Link href="/checkin/scan" className="flex items-center gap-3 px-4 py-3">
                            <span className="text-xl">📱</span><p className="font-medium text-gray-800">QR Check-in Scanner</p>
                        </Link>
                        <Link href="/photos" className="flex items-center gap-3 px-4 py-3">
                            <span className="text-xl">📸</span><p className="font-medium text-gray-800">Photo Wall</p>
                        </Link>
                        <Link href="/incidents/new" className="flex items-center gap-3 px-4 py-3">
                            <span className="text-xl">🚨</span><p className="font-medium text-gray-800">Report Incident</p>
                        </Link>
                        {isStaff && (
                            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-primary-700">
                                <span className="text-xl">⚙️</span><p className="font-semibold">Staff Admin Panel</p>
                            </Link>
                        )}
                    </div>

                    {/* Check-in history */}
                    <div className="card">
                        <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase">My Check-ins</p>
                        {checkins.length === 0 ? (
                            <p className="px-4 py-4 text-sm text-gray-400">No check-ins yet.</p>
                        ) : checkins.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 border-t border-gray-50">
                                <span className="text-green-500">✅</span>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{c.checkpoint_title}</p>
                                    <p className="text-xs text-gray-400">{new Date(c.checked_in_at).toLocaleString("zh-TW")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <BottomNav active="me" />
            </div>
        </AuthGate>
    );
}
