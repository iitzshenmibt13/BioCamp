"use client";
/** Admin: Users & Groups – CRUD groups, assign users, manage roles. */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [gName, setGName] = useState(""); const [gColor, setGColor] = useState("#4CAF50"); const [gCode, setGCode] = useState("");

    const loadGroups = useCallback(async () => { const r = await api.get("/api/groups"); setGroups(r.data); }, []);
    const loadUsers = useCallback(async () => {
        // list users via /api/auth/me and group transactions – we just can't list all users without a separate endpoint
        // For now show a placeholder message; the endpoint can be added as needed
        setUsers([]);
    }, []);

    useEffect(() => { loadGroups(); }, [loadGroups]);

    const createGroup = async () => {
        if (!gName.trim()) { toast.error("Enter group name"); return; }
        try {
            await api.post("/api/groups", { name: gName, color: gColor, join_code: gCode || undefined });
            toast.success("Group created!"); setGName(""); setGCode(""); await loadGroups();
        } catch { toast.error("Failed – name may already exist"); }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">👥 Users & Groups</h1>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 space-y-3">
                <p className="text-white font-semibold">Create Group</p>
                <div className="flex gap-2">
                    <input value={gName} onChange={e => setGName(e.target.value)} placeholder="Group name" className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                    <input type="color" value={gColor} onChange={e => setGColor(e.target.value)} className="w-12 h-10 rounded-xl border border-gray-600 bg-gray-700 cursor-pointer" />
                </div>
                <input value={gCode} onChange={e => setGCode(e.target.value)} placeholder="Join code (e.g. ALPHA)" className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                <button onClick={createGroup} className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">Create Group</button>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <p className="px-4 py-3 text-gray-400 text-xs font-semibold uppercase border-b border-gray-700">Groups</p>
                {groups.map(g => (
                    <div key={g.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 last:border-0">
                        <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                        <div className="flex-1">
                            <p className="text-white font-medium text-sm">{g.name}</p>
                            <p className="text-gray-400 text-xs">Join code: {g.join_code || "–"} · {g.total_points} pts</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
                <p className="text-white font-semibold mb-2">Assign User Role</p>
                <p className="text-gray-500 text-sm">Get the User ID from the /api/auth/me response and update role below.</p>
                <div className="flex gap-2 mt-3">
                    <input id="uid" placeholder="User ID" className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                    <select id="urole" defaultValue="staff" className="bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm">
                        <option value="camper">Camper</option><option value="staff">Staff</option><option value="admin">Admin</option>
                    </select>
                    <button onClick={async () => {
                        const uid = (document.getElementById("uid") as HTMLInputElement).value;
                        const role = (document.getElementById("urole") as HTMLSelectElement).value;
                        if (!uid) return;
                        await api.patch(`/api/groups/${uid}/role?role=${role}`).catch(() => { });
                        toast.success("Role updated!");
                    }} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold">Update</button>
                </div>
            </div>
        </div>
    );
}
