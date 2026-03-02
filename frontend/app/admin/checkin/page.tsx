"use client";
import { useState } from "react";
import { Plus, QrCode, Download } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { MOCK_CHECKPOINTS, MOCK_CHECKINS, MOCK_SCHEDULE, MOCK_USER_ADMIN } from "@/lib/mock";
import { formatTime, getGroupStyle } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminCheckinPage() {
    const user = MOCK_USER_ADMIN;
    const [checkpoints, setCheckpoints] = useState(MOCK_CHECKPOINTS);
    const [selectedCp, setSelectedCp] = useState(MOCK_CHECKPOINTS[0]);
    const [showCreate, setShowCreate] = useState(false);
    const [newSchedId, setNewSchedId] = useState(MOCK_SCHEDULE[0].id);
    const [newPoints, setNewPoints] = useState("10");

    const checkins = MOCK_CHECKINS.filter(c => c.checkpointId === selectedCp?.id);

    function createCheckpoint() {
        const sched = MOCK_SCHEDULE.find(s => s.id === newSchedId)!;
        const cp = {
            id: `cp${Date.now()}`,
            scheduleItemId: newSchedId,
            scheduleItemTitle: sched.title,
            pointsAwarded: Number(newPoints),
            qrPayload: `camp:checkin:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        };
        setCheckpoints(p => [...p, cp]);
        setSelectedCp(cp);
        setShowCreate(false);
        toast.success("Checkpoint created!");
    }

    return (
        <AdminShell user={user} title="Check-in Manager">
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
                {checkpoints.map(cp => (
                    <button key={cp.id} onClick={() => setSelectedCp(cp)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedCp?.id === cp.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                        {cp.scheduleItemTitle}
                    </button>
                ))}
                <button onClick={() => setShowCreate(v => !v)} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 flex items-center gap-1">
                    <Plus size={12} /> New
                </button>
            </div>

            {showCreate && (
                <div className="card p-4 mb-4 space-y-3">
                    <p className="text-sm font-bold">Create Checkpoint</p>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Schedule Item</p>
                        <select value={newSchedId} onChange={e => setNewSchedId(e.target.value)} className="input text-sm">
                            {MOCK_SCHEDULE.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Points Awarded</p>
                        <input type="number" value={newPoints} onChange={e => setNewPoints(e.target.value)} className="input text-sm" />
                    </div>
                    <button onClick={createCheckpoint} className="btn btn-primary text-sm w-full">Create & Generate QR</button>
                </div>
            )}

            {selectedCp && (
                <div className="grid md:grid-cols-2 gap-4">
                    {/* QR display */}
                    <div className="card p-6 flex flex-col items-center gap-4">
                        <div className="w-48 h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50">
                            <QrCode size={80} className="text-gray-400" />
                            <p className="text-[10px] text-gray-400 font-mono text-center px-2 break-all">{selectedCp.qrPayload}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{selectedCp.scheduleItemTitle}</p>
                        <p className="text-xs text-gray-500">+{selectedCp.pointsAwarded} pts per scan</p>
                        <button className="btn btn-ghost text-xs gap-2"><Download size={13} /> Download QR</button>
                    </div>

                    {/* Attendance */}
                    <div className="card overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <p className="text-sm font-bold text-gray-900">Attendance ({checkins.length})</p>
                            <button className="text-xs text-primary font-semibold">Export CSV</button>
                        </div>
                        {checkins.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-gray-400">No check-ins yet</p>
                        ) : (
                            <div className="divide-y divide-border/50 max-h-80 overflow-y-auto">
                                {checkins.map(ci => {
                                    const gs = getGroupStyle(ci.groupName);
                                    return (
                                        <div key={ci.id} className="px-4 py-3 flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: gs.color }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{ci.userName}</p>
                                                <p className="text-[10px] text-gray-400">{ci.groupName} · {formatTime(ci.checkedInAt)}</p>
                                            </div>
                                            {ci.pointsAwarded > 0 && <span className="badge bg-green-50 text-success text-[10px] shrink-0">+{ci.pointsAwarded}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
