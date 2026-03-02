"use client";
import { useState, useEffect } from "react";
import { getDevSession, setDevSession, type DevSession } from "@/lib/liff";
import { MOCK_GROUPS } from "@/lib/mock";

/** Shows a floating dev login button when no LIFF_ID is set. */
export function DevLoginModal() {
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState<DevSession["role"]>("camper");
    const [groupId, setGroupId] = useState<string>("g1");
    const [current, setCurrent] = useState<DevSession | null>(null);
    const isDevMode = !process.env.NEXT_PUBLIC_LIFF_ID;

    useEffect(() => { setCurrent(getDevSession()); }, []);
    if (!isDevMode) return null;

    const save = () => {
        const s: DevSession = { role, groupId: role === "camper" ? groupId : null };
        setDevSession(s);
        setCurrent(s);
        setOpen(false);
        window.location.reload();
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-24 right-4 z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-lifted font-mono opacity-80 hover:opacity-100 transition-opacity"
            >
                {current ? `👤 ${current.role}` : "🔑 Dev Login"}
            </button>
            {open && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4" onClick={() => setOpen(false)}>
                    <div className="card w-full max-w-sm p-5 space-y-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-base font-bold text-gray-900">🔑 Dev Login</h3>
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Role</p>
                            <div className="grid grid-cols-3 gap-2">
                                {(["camper", "staff", "admin"] as const).map(r => (
                                    <button key={r} onClick={() => setRole(r)}
                                        className={`py-2 rounded-xl text-sm font-semibold transition-colors ${role === r ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {role === "camper" && (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 font-semibold uppercase">Group</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {MOCK_GROUPS.map(g => (
                                        <button key={g.id} onClick={() => setGroupId(g.id)}
                                            className={`py-2 px-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${groupId === g.id ? "ring-2 ring-offset-1" : "bg-gray-100 text-gray-700"}`}
                                            style={{ ringColor: g.color }}>
                                            <span className="w-3 h-3 rounded-full" style={{ background: g.color }} />
                                            {g.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button onClick={save} className="btn btn-primary w-full">Login as {role}</button>
                    </div>
                </div>
            )}
        </>
    );
}
