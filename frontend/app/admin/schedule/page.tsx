"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { TimelineItem } from "@/components/TimelineItem";
import { MOCK_SCHEDULE, MOCK_USER_ADMIN } from "@/lib/mock";
import { formatTime } from "@/lib/utils";
import type { ScheduleItem } from "@/lib/types";
import toast from "react-hot-toast";

export default function AdminSchedulePage() {
    const user = MOCK_USER_ADMIN;
    const [items, setItems] = useState(MOCK_SCHEDULE);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<Partial<ScheduleItem>>({});

    function openEdit(item?: ScheduleItem) {
        setEditing(item ? { ...item } : { title: "", startAt: "", endAt: "", locationText: "", tags: [], isPublished: false });
        setDrawerOpen(true);
    }

    function save() {
        if (!editing.title || !editing.startAt || !editing.endAt) {
            toast.error("Title, start and end time are required.");
            return;
        }
        if (editing.id) {
            setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...editing } as ScheduleItem : i));
            toast.success("Updated!");
        } else {
            const newItem: ScheduleItem = { ...editing as any, id: Date.now().toString(), tags: editing.tags || [], isPublished: editing.isPublished ?? false };
            setItems(prev => [...prev, newItem].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()));
            toast.success("Added!");
        }
        setDrawerOpen(false);
    }

    function remove(id: string) { setItems(p => p.filter(i => i.id !== id)); toast("Deleted", { icon: "🗑️" }); }
    function togglePublish(id: string) { setItems(p => p.map(i => i.id === id ? { ...i, isPublished: !i.isPublished } : i)); }

    return (
        <AdminShell user={user} title="Schedule Editor">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">{items.length} items</p>
                <button onClick={() => openEdit()} className="btn btn-primary text-sm gap-2"><Plus size={15} /> Add Item</button>
            </div>

            <div className="card divide-y divide-border/50">
                {items.map(item => (
                    <div key={item.id} className="p-3 flex items-center gap-3 hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${item.isPublished ? "bg-success" : "bg-gray-300"}`} />
                                <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{formatTime(item.startAt)} – {formatTime(item.endAt)}{item.locationText ? ` · ${item.locationText}` : ""}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                            <button onClick={() => togglePublish(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 text-gray-500" title={item.isPublished ? "Unpublish" : "Publish"}>
                                {item.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                            </button>
                            <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 text-gray-500">
                                <Edit2 size={14} />
                            </button>
                            <button onClick={() => remove(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-danger">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setDrawerOpen(false)}>
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                    <div className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-lifted p-5 space-y-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-base font-bold">{editing.id ? "Edit Item" : "New Item"}</h3>
                        <input value={editing.title || ""} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="Title *" className="input text-sm" />
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Start *</p>
                                <input type="datetime-local" value={editing.startAt?.slice(0, 16) || ""} onChange={e => setEditing(p => ({ ...p, startAt: new Date(e.target.value).toISOString() }))} className="input text-sm" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">End *</p>
                                <input type="datetime-local" value={editing.endAt?.slice(0, 16) || ""} onChange={e => setEditing(p => ({ ...p, endAt: new Date(e.target.value).toISOString() }))} className="input text-sm" />
                            </div>
                        </div>
                        <input value={editing.locationText || ""} onChange={e => setEditing(p => ({ ...p, locationText: e.target.value }))} placeholder="Location (optional)" className="input text-sm" />
                        <input value={editing.description || ""} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} placeholder="Notes / Description" className="input text-sm" />
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editing.isPublished || false} onChange={e => setEditing(p => ({ ...p, isPublished: e.target.checked }))} className="w-4 h-4 rounded" />
                            <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                        </label>
                        <div className="flex gap-2">
                            <button onClick={() => setDrawerOpen(false)} className="btn btn-ghost flex-1 text-sm">Cancel</button>
                            <button onClick={save} className="btn btn-primary flex-1 text-sm">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
