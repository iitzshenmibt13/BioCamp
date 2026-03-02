"use client";
/** Admin: Announcements – create, pin, delete. */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminAnnouncementsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [form, setForm] = useState({ title: "", content: "", target: "all", is_pinned: false });
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        const r = await api.get("/api/announcements");
        setItems(r.data);
    }, []);
    useEffect(() => { load(); }, [load]);

    const create = async () => {
        try { await api.post("/api/announcements", form); toast.success("Created!"); setCreating(false); await load(); }
        catch { toast.error("Failed"); }
    };
    const remove = async (id: string) => { await api.delete(`/api/announcements/${id}`); toast.success("Deleted"); await load(); };
    const togglePin = async (id: string, current: boolean) => { await api.patch(`/api/announcements/${id}/pin?pinned=${!current}`); await load(); };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">📢 Announcements</h1>
                <button onClick={() => setCreating(true)} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">+ New</button>
            </div>
            {creating && (
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 space-y-3">
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                    <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Content" className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm h-24 resize-none" />
                    <div className="flex gap-3 items-center">
                        <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm">
                            <option value="all">All</option><option value="staff">Staff only</option>
                        </select>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_pinned} onChange={e => setForm({ ...form, is_pinned: e.target.checked })} />
                            <span className="text-gray-300 text-sm">Pin</span>
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={create} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold">Post</button>
                        <button onClick={() => setCreating(false)} className="px-4 py-2.5 bg-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
                    </div>
                </div>
            )}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                {items.map(a => (
                    <div key={a.id} className="flex items-start gap-3 p-4 border-b border-gray-700 last:border-0">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                {a.is_pinned && <span>📌</span>}
                                <p className="text-white font-medium text-sm truncate">{a.title}</p>
                                <span className="text-gray-500 text-xs shrink-0">[{a.target}]</span>
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{a.content}</p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                            <button onClick={() => togglePin(a.id, a.is_pinned)} className="text-xs px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg">{a.is_pinned ? "Unpin" : "Pin"}</button>
                            <button onClick={() => remove(a.id)} className="text-xs px-3 py-1.5 bg-red-900 text-red-300 rounded-lg">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
