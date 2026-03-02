"use client";
import { useState } from "react";
import { CamperLayout } from "@/components/CamperLayout";
import { PointsTransactionRow } from "@/components/PointsTransactionRow";
import { EmptyState } from "@/components/EmptyState";
import { MOCK_TRANSACTIONS, MOCK_USER_CAMPER } from "@/lib/mock";
import { TrendingUp } from "lucide-react";
import type { PointCategory } from "@/lib/types";

const FILTERS: Array<{ label: string; value: PointCategory | "all" }> = [
    { label: "All", value: "all" },
    { label: "🎮 Game", value: "game" },
    { label: "📝 Homework", value: "homework" },
    { label: "✅ Attendance", value: "attendance" },
    { label: "⭐ Bonus", value: "bonus" },
    { label: "❌ Penalty", value: "penalty" },
];

export default function PointsLogPage() {
    const user = MOCK_USER_CAMPER;
    const [filter, setFilter] = useState<PointCategory | "all">("all");

    const txs = MOCK_TRANSACTIONS.filter(
        tx => tx.groupId === user.groupId && (filter === "all" || tx.category === filter)
    );

    const total = txs.filter(tx => !tx.isReversed).reduce((s, tx) => s + tx.deltaPoints, 0);

    return (
        <CamperLayout title="Points Log" user={user}>
            {/* Summary */}
            <div className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-soft rounded-2xl flex items-center justify-center">
                    <TrendingUp size={22} className="text-primary" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">Group Total</p>
                    <p className="text-2xl font-bold text-gray-900">{total > 0 ? "+" : ""}{total} pts</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                {FILTERS.map(f => (
                    <button key={f.value} onClick={() => setFilter(f.value)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f.value ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {txs.length === 0 ? (
                <EmptyState icon={TrendingUp} title="No transactions yet" description="Points will appear here as you earn them." />
            ) : (
                <div className="card divide-y divide-border/50">
                    {[...txs].reverse().map(tx => (
                        <PointsTransactionRow key={tx.id} tx={tx} />
                    ))}
                </div>
            )}
        </CamperLayout>
    );
}
