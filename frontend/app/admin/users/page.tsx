"use client";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { MOCK_USER_ADMIN } from "@/lib/mock";
import { MOCK_GROUPS } from "@/lib/mock";
import type { UserRole } from "@/lib/types";
import { getGroupStyle } from "@/lib/utils";
import toast from "react-hot-toast";

const MOCK_USERS = [
    { id: "u1", name: "Alex Chen", role: "camper" as UserRole, groupId: "g1" },
    { id: "u2", name: "Maya Liu", role: "camper" as UserRole, groupId: "g2" },
    { id: "u3", name: "Sam Park", role: "staff" as UserRole, groupId: null },
    { id: "u4", name: "Dr. Lin", role: "staff" as UserRole, groupId: null },
    { id: "u5", name: "Ms. Wang", role: "staff" as UserRole, groupId: null },
];

const ROLE_STYLE: Record<string, string> = {
    admin: "bg-red-50 text-danger",
    staff: "bg-blue-50 text-primary",
    camper: "bg-gray-100 text-gray-600",
};

export default function AdminUsersPage() {
    const user = MOCK_USER_ADMIN;
    const [users, setUsers] = useState(MOCK_USERS);
    const [search, setSearch] = useState("");

    const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

    function changeRole(id: string, role: UserRole) {
        setUsers(p => p.map(u => u.id === id ? { ...u, role } : u));
        toast.success("Role updated");
    }

    return (
        <AdminShell user={user} title="User Management">
            <div className="mb-4">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="input text-sm" />
            </div>
            <div className="card divide-y divide-border/50">
                {filtered.map(u => {
                    const group = MOCK_GROUPS.find(g => g.id === u.groupId);
                    const gs = group ? getGroupStyle(group.name) : null;
                    return (
                        <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-sm font-bold text-gray-500">
                                {u.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                                {group && gs && (
                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                        <span className="w-2 h-2 rounded-full" style={{ background: gs.color }} />{group.name}
                                    </p>
                                )}
                            </div>
                            <select value={u.role} onChange={e => changeRole(u.id, e.target.value as UserRole)}
                                className={`text-xs font-semibold px-2 py-1.5 rounded-lg border-0 outline-none cursor-pointer capitalize ${ROLE_STYLE[u.role]}`}>
                                <option value="camper">camper</option>
                                <option value="staff">staff</option>
                                <option value="admin">admin</option>
                            </select>
                        </div>
                    );
                })}
            </div>
        </AdminShell>
    );
}
