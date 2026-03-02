"use client";
/**
 * Game Mode – mobile-first rapid scoring UI.
 * Large buttons, group selection, undo last.
 */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const DELTAS = [
    { label: "+1", value: 1, color: "bg-blue-500 hover:bg-blue-600" },
    { label: "+3", value: 3, color: "bg-green-500 hover:bg-green-600" },
    { label: "+5", value: 5, color: "bg-primary-600 hover:bg-primary-700" },
    { label: "+10", value: 10, color: "bg-yellow-500 hover:bg-yellow-600" },
    { label: "-1", value: -1, color: "bg-red-400 hover:bg-red-500" },
    { label: "-3", value: -3, color: "bg-red-600 hover:bg-red-700" },
];

const REASONS = ["Correct answer", "Bonus round", "Speed bonus", "Participation", "Creative solution", "Penalty"];

export default function GameModePage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [selectedDelta, setSelectedDelta] = useState<number | null>(null);
    const [reason, setReason] = useState(REASONS[0]);
    const [customReason, setCustomReason] = useState("");
    const [lastTxId, setLastTxId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const loadGroups = useCallback(async () => {
        const r = await api.get("/api/groups");
        setGroups(r.data.sort((a: any, b: any) => b.total_points - a.total_points));
    }, []);

    useEffect(() => { loadGroups(); }, [loadGroups]);

    const addPoints = async () => {
        if (!selectedGroup || selectedDelta === null) { toast.error("Select group and points"); return; }
        setSubmitting(true);
        try {
            const r = await api.post("/api/points/transactions", {
                group_id: selectedGroup,
                delta_points: selectedDelta,
                category: "game",
                reason: customReason || reason,
            });
            setLastTxId(r.data.id);
            toast.success(`${selectedDelta > 0 ? "+" : ""}${selectedDelta} pts added!`);
            await loadGroups();
        } catch { toast.error("Failed"); }
        finally { setSubmitting(false); }
    };

    const undo = async () => {
        if (!lastTxId) return;
        try {
            await api.post(`/api/points/transactions/${lastTxId}/undo`);
            toast.success("Undone!");
            setLastTxId(null);
            await loadGroups();
        } catch (e: any) { toast.error(e.response?.data?.detail || "Undo failed"); }
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">🎮 Game Mode</h1>
                {lastTxId && (
                    <button onClick={undo} className="px-4 py-2 bg-gray-700 text-yellow-400 rounded-xl text-sm font-semibold hover:bg-gray-600 transition-colors">
                        ↩ Undo Last
                    </button>
                )}
            </div>

            {/* Group selection */}
            <div>
                <p className="text-gray-400 text-sm mb-2 font-medium">Select Group</p>
                <div className="grid grid-cols-2 gap-2">
                    {groups.map(g => (
                        <button key={g.id} onClick={() => setSelectedGroup(g.id)}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedGroup === g.id ? "border-white bg-gray-700" : "border-gray-700 bg-gray-800 hover:border-gray-500"}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                                <p className="font-bold text-white text-sm">{g.name}</p>
                            </div>
                            <p className="text-2xl font-black" style={{ color: g.color }}>{g.total_points}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Delta buttons */}
            <div>
                <p className="text-gray-400 text-sm mb-2 font-medium">Points</p>
                <div className="grid grid-cols-3 gap-2">
                    {DELTAS.map(d => (
                        <button key={d.value} onClick={() => setSelectedDelta(d.value)}
                            className={`${d.color} text-white py-4 rounded-2xl text-xl font-black transition-all border-2 ${selectedDelta === d.value ? "border-white scale-105" : "border-transparent"}`}>
                            {d.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reason */}
            <div>
                <p className="text-gray-400 text-sm mb-2 font-medium">Reason</p>
                <div className="flex flex-wrap gap-2 mb-2">
                    {REASONS.map(r => (
                        <button key={r} onClick={() => { setReason(r); setCustomReason(""); }}
                            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${reason === r && !customReason ? "bg-white text-gray-900" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                            {r}
                        </button>
                    ))}
                </div>
                <input value={customReason} onChange={e => setCustomReason(e.target.value)} placeholder="Or type custom reason..." className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>

            {/* Submit */}
            <button onClick={addPoints} disabled={submitting || !selectedGroup || selectedDelta === null}
                className="w-full py-5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black text-xl rounded-2xl transition-all active:scale-95">
                {submitting ? "Adding..." : "✅ Add Points"}
            </button>
        </div>
    );
}
