"use client";
import { useState, useRef } from "react";
import { Minus, Plus, RotateCcw, Search } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { MOCK_GROUPS, MOCK_USER_ADMIN } from "@/lib/mock";
import { getGroupStyle } from "@/lib/utils";
import type { PointTransaction, PointCategory } from "@/lib/types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const REASON_PRESETS = ["Win", "Participation", "Bonus", "Penalty", "Custom…"];
const DELTAS = [1, 3, 5, 10];

export default function AdminGamePage() {
    const user = MOCK_USER_ADMIN;
    const [selectedGroup, setSelectedGroup] = useState(MOCK_GROUPS[0]);
    const [search, setSearch] = useState("");
    const [history, setHistory] = useState<Array<{ id: string; groupName: string; delta: number; reason: string; color: string }>>([]);
    const [undoId, setUndoId] = useState<string | null>(null);
    const undoTimerRef = useRef<ReturnType<typeof setTimeout>>();

    const filtered = MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
    const style = getGroupStyle(selectedGroup.name);

    function addPoints(delta: number, reason: string) {
        const newEntry = {
            id: Date.now().toString(),
            groupName: selectedGroup.name,
            delta, reason,
            color: selectedGroup.color,
        };
        setHistory(h => [newEntry, ...h.slice(0, 19)]);
        setUndoId(newEntry.id);
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = setTimeout(() => setUndoId(null), 10000);
        toast.success(`${delta > 0 ? "+" : ""}${delta} pts → ${selectedGroup.name}`);
    }

    function undo() {
        setHistory(h => h.filter(e => e.id !== undoId));
        setUndoId(null);
        toast("Undid last action", { icon: "↩️" });
    }

    return (
        <AdminShell user={user} title="Game Mode">
            <div className="max-w-md mx-auto space-y-4">
                {/* Group selector */}
                <div className="card p-3">
                    <div className="relative mb-2">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search group…" className="input pl-8 py-2 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                        {filtered.map(g => {
                            const s = getGroupStyle(g.name);
                            return (
                                <button key={g.id} onClick={() => setSelectedGroup(g)}
                                    className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                                        selectedGroup.id === g.id ? "border-current" : "border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100")}
                                    style={selectedGroup.id === g.id ? { color: s.color, background: s.bg, borderColor: s.color } : {}}>
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                                    {g.name.replace("Team ", "")}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected group banner */}
                <div className="rounded-2xl p-4 text-center" style={{ background: style.bg, border: `2px solid ${style.color}30` }}>
                    <p className="text-sm font-semibold" style={{ color: style.color }}>{selectedGroup.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{selectedGroup.totalPoints.toLocaleString()} pts</p>
                </div>

                {/* +/- buttons */}
                <div className="card p-4 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Add Points</p>
                    <div className="grid grid-cols-4 gap-2">
                        {DELTAS.map(d => (
                            <button key={d} onClick={() => addPoints(d, "Game")}
                                className="h-16 rounded-2xl bg-blue-50 text-primary font-bold text-xl hover:bg-primary hover:text-white transition-all active:scale-95 flex flex-col items-center justify-center">
                                <Plus size={14} />
                                {d}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => addPoints(-1, "Penalty")}
                        className="w-full h-12 rounded-2xl bg-red-50 text-danger font-bold hover:bg-danger hover:text-white transition-all flex items-center justify-center gap-2">
                        <Minus size={16} /> 1 (Penalty)
                    </button>
                </div>

                {/* Reason presets */}
                <div className="card p-4 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quick Reasons</p>
                    <div className="flex flex-wrap gap-2">
                        {REASON_PRESETS.map(r => (
                            <button key={r} onClick={() => addPoints(3, r)}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-primary hover:text-white transition-colors">
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Undo */}
                {undoId && (
                    <button onClick={undo}
                        className="w-full btn btn-ghost gap-2 text-sm border-warning text-warning hover:bg-amber-50">
                        <RotateCcw size={15} /> Undo Last Action
                    </button>
                )}

                {/* History */}
                {history.length > 0 && (
                    <div className="card overflow-hidden">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-2 border-b border-border">Recent</p>
                        <div className="divide-y divide-border/50 max-h-52 overflow-y-auto">
                            {history.map(e => (
                                <div key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                                    <span className={cn("w-10 text-center text-sm font-bold rounded-lg py-1",
                                        e.delta > 0 ? "bg-green-50 text-success" : "bg-red-50 text-danger")}>
                                        {e.delta > 0 ? "+" : ""}{e.delta}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800">{e.groupName}</p>
                                        <p className="text-[10px] text-gray-400">{e.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
