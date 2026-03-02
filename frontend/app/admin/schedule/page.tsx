"use client";
/** Admin: Schedule Editor – CRUD, publish. */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

type Item = { id: string; title: string; start_at: string; end_at: string; location_text?: string; maps_url?: string; description?: string; is_published: boolean; day_index?: number };

const fmt = (dt: string) => dt ? new Date(dt).toLocaleString("zh-TW") : "";

const EMPTY: Partial<Item> = { title: "", start_at: "", end_at: "", location_text: "", maps_url: "", description: "", is_published: false };

export default function AdminSchedulePage() {
    const [items, setItems] = useState<Item[]>([]);
    const [editing, setEditing] = useState<Partial<Item> | null>(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        const r = await api.get("/api/schedule");
        setItems(r.data.sort((a: Item, b: Item) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()));
    }, []);
    useEffect(() => { load(); }, [load]);

    const save = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            if (editing.id) {
                await api.patch(`/api/schedule/${editing.id}`, editing);
            } else {
                await api.post("/api/schedule", editing);
            }
            toast.success("Saved!");
            setEditing(null);
            await load();
        } catch { toast.error("Save failed"); }
        finally { setSaving(false); }
    };

    const publish = async (id: string) => {
        await api.post(`/api/schedule/${id}/publish`);
        toast.success("Published!"); await load();
    };

    const remove = async (id: string) => {
        if (!confirm("Delete this item?")) return;
        await api.delete(`/api/schedule/${id}`);
        toast.success("Deleted"); await load();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">📅 Schedule Editor</h1>
                <button onClick={() => setEditing({ ...EMPTY })} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">+ New Item</button>
            </div>

            {/* Editor modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setEditing(null)}>
                    <div className="bg-gray-800 rounded-2xl w-full max-w-lg p-5 space-y-3 max-h-[90vh] overflow-y-auto">
                        <p className="text-white font-bold text-lg">{editing.id ? "Edit Item" : "New Item"}</p>
                        <label className="block text-gray-400 text-xs">Title *</label>
                        <input value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="Title" />
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-gray-400 text-xs mb-1">Start</label>
                                <input type="datetime-local" value={editing.start_at ? editing.start_at.slice(0, 16) : ""} onChange={e => setEditing({ ...editing, start_at: new Date(e.target.value).toISOString() })} className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs mb-1">End</label>
                                <input type="datetime-local" value={editing.end_at ? editing.end_at.slice(0, 16) : ""} onChange={e => setEditing({ ...editing, end_at: new Date(e.target.value).toISOString() })} className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                            </div>
                        </div>
                        <input value={editing.location_text || ""} onChange={e => setEditing({ ...editing, location_text: e.target.value })} className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="Location" />
                        <input value={editing.maps_url || ""} onChange={e => setEditing({ ...editing, maps_url: e.target.value })} className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="Maps URL (optional)" />
                        <textarea value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none h-20 resize-none" placeholder="Description" />
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!editing.is_published} onChange={e => setEditing({ ...editing, is_published: e.target.checked })} className="w-4 h-4 accent-primary-500" />
                            <span className="text-gray-300 text-sm">Published (visible to campers)</span>
                        </label>
                        <div className="flex gap-2 pt-2">
                            <button onClick={save} disabled={saving} className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm">{saving ? "Saving..." : "Save"}</button>
                            <button onClick={() => setEditing(null)} className="px-4 py-3 bg-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                {items.length === 0 ? (
                    <p className="p-8 text-center text-gray-500">No schedule items. Click "+ New Item" to create one.</p>
                ) : items.map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-4 border-b border-gray-700 last:border-0">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-white font-medium truncate">{item.title}</p>
                                <span className={`badge shrink-0 ${item.is_published ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-400"}`}>
                                    {item.is_published ? "Published" : "Draft"}
                                </span>
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5">{fmt(item.start_at)} → {fmt(item.end_at)}</p>
                            {item.location_text && <p className="text-gray-500 text-xs">📍 {item.location_text}</p>}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                            <button onClick={() => setEditing(item)} className="text-xs px-3 py-1.5 bg-gray-700 text-gray-300 hover:text-white rounded-lg">Edit</button>
                            {!item.is_published && <button onClick={() => publish(item.id)} className="text-xs px-3 py-1.5 bg-green-800 text-green-300 hover:bg-green-700 rounded-lg">Publish</button>}
                            <button onClick={() => remove(item.id)} className="text-xs px-3 py-1.5 bg-red-900 text-red-300 hover:bg-red-800 rounded-lg">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
