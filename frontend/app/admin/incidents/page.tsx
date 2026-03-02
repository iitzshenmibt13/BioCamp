"use client";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { MOCK_INCIDENTS, MOCK_USER_ADMIN } from "@/lib/mock";
import { formatRelative, cn } from "@/lib/utils";
import type { Incident, IncidentStatus } from "@/lib/types";
import toast from "react-hot-toast";

const SEV_STYLE: Record<string, string> = {
    high: "bg-red-100 text-danger border-red-200",
    medium: "bg-amber-100 text-warning border-amber-200",
    low: "bg-gray-100 text-gray-600 border-gray-200",
};
const STATUS_STYLE: Record<string, string> = {
    new: "bg-red-50 text-danger",
    triaged: "bg-amber-50 text-warning",
    resolved: "bg-green-50 text-success",
};

export default function AdminIncidentsPage() {
    const user = MOCK_USER_ADMIN;
    const [incidents, setIncidents] = useState([...MOCK_INCIDENTS].sort((a, b) => {
        const sev = { high: 0, medium: 1, low: 2 };
        return sev[a.severity] - sev[b.severity];
    }));
    const [selected, setSelected] = useState<Incident | null>(null);
    const [notes, setNotes] = useState("");
    const [newStatus, setNewStatus] = useState<IncidentStatus>("triaged");

    function updateIncident() {
        setIncidents(p => p.map(i => i.id === selected?.id ? { ...i, status: newStatus, internalNotes: notes } : i));
        toast.success("Updated!");
        setSelected(null);
    }

    return (
        <AdminShell user={user} title="Incident Reports">
            <div className="grid md:grid-cols-2 gap-4">
                {/* Inbox */}
                <div className="space-y-2">
                    {incidents.map(inc => (
                        <button key={inc.id} onClick={() => { setSelected(inc); setNotes(inc.internalNotes || ""); setNewStatus(inc.status); }}
                            className={cn("card p-4 w-full text-left hover:shadow-lifted transition-shadow", selected?.id === inc.id && "ring-2 ring-primary")}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn("badge border text-[10px]", SEV_STYLE[inc.severity])}>{inc.severity}</span>
                                <span className={cn("badge text-[10px]", STATUS_STYLE[inc.status])}>{inc.status}</span>
                                <span className="text-[10px] text-gray-400 ml-auto">{formatRelative(inc.createdAt)}</span>
                            </div>
                            <p className="text-xs font-semibold text-gray-900 capitalize mb-1">{inc.category.replace("_", " ")}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{inc.content}</p>
                        </button>
                    ))}
                    {incidents.length === 0 && <p className="card p-8 text-center text-sm text-gray-400">No incidents reported</p>}
                </div>

                {/* Detail / update */}
                {selected && (
                    <div className="card p-4 self-start space-y-3">
                        <p className="text-sm font-bold text-gray-900">Incident Detail</p>
                        <div className="flex gap-2">
                            <span className={cn("badge border text-[10px]", SEV_STYLE[selected.severity])}>{selected.severity}</span>
                            <span className="badge text-[10px] bg-gray-100 text-gray-600 capitalize">{selected.category}</span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">{selected.content}</p>
                        {selected.contactPhone && <p className="text-xs text-gray-500">📞 {selected.contactPhone}</p>}
                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Update Status</p>
                            <div className="flex gap-2">
                                {(["new", "triaged", "resolved"] as IncidentStatus[]).map(s => (
                                    <button key={s} onClick={() => setNewStatus(s)}
                                        className={cn("flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize", newStatus === s ? STATUS_STYLE[s] + " border-current" : "bg-white text-gray-500 border-border")}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Internal Notes</p>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add notes visible only to staff…" className="input text-sm resize-none" />
                        </div>
                        <button onClick={updateIncident} className="btn btn-primary text-sm w-full">Save Update</button>
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
