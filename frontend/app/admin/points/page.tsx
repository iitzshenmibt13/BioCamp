"use client";
/** Admin: Points console – add transaction, audit log, undo. */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const CATEGORIES = ["game", "homework", "attendance", "bonus", "penalty"] as const;
const CATEGORY_ICON: Record<string, string> = { game: "🎮", homework: "📝", attendance: "✅", bonus: "⭐", penalty: "❌" };

export default function AdminPointsPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [form, setForm] = useState({ group_id: "", delta_points: "5", category: "bonus", reason: "" });
    const [transactions, setTransactions] = useState<any[]>([]);

    const loadGroups = useCallback(async () => {
        const r = await api.get("/api/groups");
        setGroups(r.data);
        if (r.data.length > 0 && !form.group_id) setForm(f => ({ ...f, group_id: r.data[0].id }));
    }, []);

    const loadTransactions = useCallback(async (gid: string) => {
        if (!gid) return;
        const r = await api.get(`/api/points/group/${gid}/transactions`);
        setTransactions(r.data);
    }, []);

    useEffect(() => { loadGroups(); }, [loadGroups]);
    useEffect(() => { if (form.group_id) loadTransactions(form.group_id); }, [form.group_id, loadTransactions]);

    const submit = async () => {
        if (!form.group_id || !form.reason) { toast.error("Fill in all fields"); return; }
        try {
            await api.post("/api/points/transactions", {
                group_id: form.group_id,
                delta_points: Number(form.delta_points),
                category: form.category,
                reason: form.reason,
            });
            toast.success("Transaction added!");
            setForm(f => ({ ...f, reason: "" }));
            await loadTransactions(form.group_id);
        } catch { toast.error("Failed"); }
    };

    const undo = async (txId: string) => {
        try {
            await api.post(`/api/points/transactions/${txId}/undo`);
            toast.success("Undone!"); await loadTransactions(form.group_id);
        } catch (e: any) { toast.error(e.response?.data?.detail || "Undo failed"); }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">🏆 Points Console</h1>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 space-y-3">
                <p className="text-white font-semibold">Add Transaction</p>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Group</label>
                        <select value={form.group_id} onChange={e => setForm({ ...form, group_id: e.target.value })} className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm">
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.total_points} pts)</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Points (can be negative)</label>
                        <input type="number" value={form.delta_points} onChange={e => setForm({ ...form, delta_points: e.target.value })} className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-400 text-xs mb-1">Category</label>
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(c => (
                            <button key={c} onClick={() => setForm({ ...form, category: c })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium ${form.category === c ? "bg-primary-600 text-white" : "bg-gray-700 text-gray-300"}`}>
                                {CATEGORY_ICON[c]} {c}
                            </button>
                        ))}
                    </div>
                </div>
                <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason *" className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                <button onClick={submit} className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">Add Transaction</button>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <p className="px-4 py-3 text-gray-400 text-xs font-semibold uppercase border-b border-gray-700">Recent Transactions</p>
                {transactions.length === 0 ? <p className="p-6 text-center text-gray-500 text-sm">No transactions yet.</p> : transactions.slice(0, 30).map(tx => (
                    <div key={tx.id} className={`flex items-center gap-3 px-4 py-3 border-b border-gray-700 last:border-0 ${tx.is_reversed ? "opacity-40" : ""}`}>
                        <span className="text-lg">{CATEGORY_ICON[tx.category]}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{tx.reason}</p>
                            <p className="text-gray-400 text-xs">{tx.created_by_name} · {new Date(tx.created_at).toLocaleString("zh-TW")}</p>
                        </div>
                        <span className={`font-bold shrink-0 ${tx.delta_points > 0 ? "text-green-400" : "text-red-400"}`}>{tx.delta_points > 0 ? "+" : ""}{tx.delta_points}</span>
                        {!tx.is_reversed && (
                            <button onClick={() => undo(tx.id)} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">↩</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
