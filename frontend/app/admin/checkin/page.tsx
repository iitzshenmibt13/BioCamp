"use client";
/** Admin: Check-in QR generator and attendance viewer. */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminCheckinPage() {
    const [title, setTitle] = useState("");
    const [points, setPoints] = useState("");
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [qrImage, setQrImage] = useState<{ url: string; title: string } | null>(null);
    const [attendance, setAttendance] = useState<any[]>([]);

    // We track created checkpoint IDs in local state for this session
    const [createdIds, setCreatedIds] = useState<{ id: string; title: string; qr_payload: string }[]>([]);

    const createCheckpoint = async () => {
        if (!title.trim()) { toast.error("Enter a title"); return; }
        try {
            const r = await api.post("/api/checkpoints", { title, points_award: points ? Number(points) : null });
            setCreatedIds(prev => [...prev, r.data]);
            toast.success("Checkpoint created!");
            setTitle(""); setPoints("");
        } catch { toast.error("Failed"); }
    };

    const showQR = async (id: string, cpTitle: string) => {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/checkpoints/${id}/qr`;
        const token = localStorage.getItem("camp_ops_jwt");
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const blob = await resp.blob();
        setQrImage({ url: URL.createObjectURL(blob), title: cpTitle });
    };

    const viewAttendance = async (id: string) => {
        const r = await api.get(`/api/checkpoints/${id}/attendance`);
        setAttendance(r.data);
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">✅ Check-in Manager</h1>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 space-y-3">
                <p className="text-white font-semibold">Create Checkpoint</p>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Checkpoint title (e.g. DNA Lab Entry)" className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                <input type="number" value={points} onChange={e => setPoints(e.target.value)} placeholder="Points award (optional)" className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                <button onClick={createCheckpoint} className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700">Create & Generate QR</button>
            </div>

            {createdIds.length > 0 && (
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                    <p className="px-4 py-3 text-gray-400 text-xs font-semibold uppercase border-b border-gray-700">Checkpoints (this session)</p>
                    {createdIds.map(cp => (
                        <div key={cp.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 last:border-0">
                            <p className="flex-1 text-white font-medium text-sm">{cp.title}</p>
                            <button onClick={() => showQR(cp.id, cp.title)} className="px-3 py-1.5 bg-indigo-800 text-indigo-300 rounded-lg text-xs">📷 QR Code</button>
                            <button onClick={() => viewAttendance(cp.id)} className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-xs">Attendance</button>
                        </div>
                    ))}
                </div>
            )}

            {qrImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setQrImage(null)}>
                    <div className="bg-white rounded-2xl p-6 text-center max-w-xs w-full">
                        <p className="font-bold text-gray-800 mb-4">{qrImage.title}</p>
                        <img src={qrImage.url} alt="QR Code" className="w-full max-w-xs mx-auto" />
                        <p className="text-gray-500 text-xs mt-3">Tap outside to close</p>
                        <a href={qrImage.url} download="checkin-qr.png" className="block mt-3 text-primary-600 text-sm underline">⬇ Download PNG</a>
                    </div>
                </div>
            )}

            {attendance.length > 0 && (
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                    <p className="px-4 py-3 text-gray-400 text-xs font-semibold uppercase border-b border-gray-700">Attendance ({attendance.length})</p>
                    {attendance.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 last:border-0">
                            <span className="text-green-400">✅</span>
                            <p className="text-white text-sm flex-1">{a.user_display_name}</p>
                            <p className="text-gray-400 text-xs">{new Date(a.checked_in_at).toLocaleString("zh-TW")}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
