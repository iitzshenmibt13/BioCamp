"use client";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { MOCK_GROUPS, MOCK_USER_ADMIN } from "@/lib/mock";
import type { Group } from "@/lib/types";
import { getGroupStyle } from "@/lib/utils";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminGroupsPage() {
    const user = MOCK_USER_ADMIN;
    const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#3B82F6");

    function createGroup() {
        if (!newName.trim()) { toast.error("Group name required."); return; }
        setGroups(p => [...p, { id: Date.now().toString(), name: newName.trim(), color: newColor, joinCode: newName.toUpperCase().slice(0, 6), totalPoints: 0, memberCount: 0 }]);
        setNewName(""); toast.success("Group created!");
    }

    return (
        <AdminShell user={user} title="Groups">
            {/* Create */}
            <div className="card p-4 mb-4 space-y-3">
                <p className="text-sm font-bold text-gray-900">Create Group</p>
                <div className="flex gap-2">
                    <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Group name" className="input text-sm flex-1" />
                    <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-12 h-11 rounded-xl border border-border cursor-pointer" title="Group color" />
                </div>
                <button onClick={createGroup} className="btn btn-primary text-sm gap-2"><Plus size={14} />Create</button>
            </div>

            {/* List */}
            <div className="card divide-y divide-border/50">
                {groups.map(g => {
                    const s = getGroupStyle(g.name);
                    return (
                        <div key={g.id} className="flex items-center gap-3 px-4 py-3">
                            <span className="w-4 h-4 rounded-full shrink-0" style={{ background: g.color || s.color }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900">{g.name}</p>
                                <p className="text-xs text-gray-400">Code: {g.joinCode} · {g.memberCount ?? 0} members · {g.totalPoints} pts</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </AdminShell>
    );
}
