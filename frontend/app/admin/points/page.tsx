"use client";
import { useState } from "react";
import { RotateCcw, Send } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { PointsTransactionRow } from "@/components/PointsTransactionRow";
import { MOCK_GROUPS, MOCK_TRANSACTIONS, MOCK_USER_ADMIN } from "@/lib/mock";
import type { PointCategory } from "@/lib/types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const CATEGORIES: PointCategory[] = ["game", "homework", "attendance", "bonus", "penalty"];

export default function AdminPointsPage() {
    const user = MOCK_USER_ADMIN;
    const [txs, setTxs] = useState(MOCK_TRANSACTIONS);
    const [groupId, setGroupId] = useState(MOCK_GROUPS[0].id);
    const [delta, setDelta] = useState("");
    const [category, setCategory] = useState<PointCategory>("game");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function submit() {
        if (!delta || !reason.trim()) { toast.error("Fill in all fields."); return; }
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 500));
        const group = MOCK_GROUPS.find(g => g.id === groupId)!;
        const newTx = {
            id: Date.now().toString(), groupId, groupName: group.name, groupColor: group.color,
            deltaPoints: Number(delta), category, reason, createdByName: user.name,
            createdAt: new Date().toISOString(), isReversed: false,
        };
        setTxs(p => [newTx, ...p]);
        setDelta(""); setReason("");
        setSubmitting(false);
        toast.success("Transaction added!");
    }

    function undo(id: string) {
        setTxs(p => p.map(t => t.id === id ? { ...t, isReversed: true, reversedAt: new Date().toISOString() } : t));
        toast("Undone", { icon: "↩️" });
    }

    return (
        <AdminShell user={user} title="Points Console">
            <div className="grid md:grid-cols-2 gap-4">
                {/* Composer */}
                <div className="card p-4 space-y-3 self-start">
                    <p className="text-sm font-bold text-gray-900">Add Transaction</p>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Group</p>
                        <select value={groupId} onChange={e => setGroupId(e.target.value)} className="input text-sm">
                            {MOCK_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Points (+ or -)</p>
                            <input type="number" value={delta} onChange={e => setDelta(e.target.value)} placeholder="e.g. 50 or -10" className="input text-sm" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Category</p>
                            <select value={category} onChange={e => setCategory(e.target.value as PointCategory)} className="input text-sm capitalize">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Reason</p>
                        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Round 2 Win" className="input text-sm" />
                    </div>
                    <button onClick={submit} disabled={submitting} className="btn btn-primary w-full gap-2 text-sm disabled:opacity-50">
                        <Send size={14} /> {submitting ? "Adding…" : "Add Transaction"}
                    </button>
                </div>

                {/* Transaction log */}
                <div className="card overflow-hidden self-start">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3 border-b border-border">All Transactions</p>
                    <div className="max-h-[60vh] overflow-y-auto px-4">
                        {txs.map(tx => (
                            <div key={tx.id} className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <PointsTransactionRow tx={tx} />
                                </div>
                                {!tx.isReversed && (
                                    <button onClick={() => undo(tx.id)} className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400" title="Undo">
                                        <RotateCcw size={13} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
