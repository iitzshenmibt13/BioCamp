"use client";
/** Admin: Incident reports – view, status update, internal notes. */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const SEVERITY_COLOR: Record<string, string> = { low: "bg-yellow-900 text-yellow-300", medium: "bg-orange-900 text-orange-300", high: "bg-red-900 text-red-300 animate-pulse" };
const STATUS_COLOR: Record<string, string> = { new: "bg-blue-900 text-blue-300", triaged: "bg-purple-900 text-purple-300", resolved: "bg-green-900 text-green-300" };

export default function AdminIncidentsPage() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [notes, setNotes] = useState("");

    const load = useCallback(async () => { const r = await api.get("/api/incidents"); setIncidents(r.data); }, []);
    useEffect(() => { load(); }, [load]);

    const update = async (id: string, status: string) => {
        try {
            await api.patch(`/api/incidents/${id}`, { status, internal_notes: notes });
            toast.success("Updated!"); await load(); setExpanded(null);
        } catch { toast.error("Failed"); }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">🚨 Incident Reports</h1>
            {incidents.length === 0 && <p className="text-gray-400 text-center py-8">No incidents reported.</p>}
            {incidents.map(i => (
                <div key={i.id} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                    <button className="w-full text-left p-4 flex items-start gap-3" onClick={() => { setExpanded(expanded === i.id ? null : i.id); setNotes(i.internal_notes || ""); }}>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`badge ${SEVERITY_COLOR[i.severity]}`}>{i.severity}</span>
                                <span className={`badge ${STATUS_COLOR[i.status]}`}>{i.status}</span>
                                <span className="text-gray-400 text-xs capitalize">{i.category}</span>
                            </div>
                            <p className="text-white text-sm font-medium mt-1 line-clamp-2">{i.content}</p>
                            <p className="text-gray-400 text-xs mt-1">{new Date(i.created_at).toLocaleString("zh-TW")}</p>
                            {i.contact_phone && <p className="text-gray-300 text-xs">📞 {i.contact_phone}</p>}
                        </div>
                    </button>
                    {expanded === i.id && (
                        <div className="border-t border-gray-700 p-4 space-y-3">
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{i.content}</p>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes" className="w-full bg-gray-900 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm h-20 resize-none" />
                            <div className="flex gap-2">
                                <button onClick={() => update(i.id, "triaged")} className="flex-1 py-2 bg-purple-800 text-purple-200 rounded-xl text-xs font-semibold">Mark Triaged</button>
                                <button onClick={() => update(i.id, "resolved")} className="flex-1 py-2 bg-green-800 text-green-200 rounded-xl text-xs font-semibold">Mark Resolved</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
