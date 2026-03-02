"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    Calendar, TrendingUp, ClipboardList, QrCode, Image,
    AlertTriangle, Users, LayoutGrid, Gamepad2, ChevronLeft,
    Menu, X, LogOut, FlaskConical
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { clearSession } from "@/lib/auth";

const NAV = [
    { href: "/admin", icon: LayoutGrid, label: "Dashboard" },
    { href: "/admin/game", icon: Gamepad2, label: "Game Mode" },
    { href: "/admin/schedule", icon: Calendar, label: "Schedule" },
    { href: "/admin/points", icon: TrendingUp, label: "Points" },
    { href: "/admin/homework", icon: ClipboardList, label: "Homework" },
    { href: "/admin/checkin", icon: QrCode, label: "Check-in" },
    { href: "/admin/photos", icon: Image, label: "Photos" },
    { href: "/admin/incidents", icon: AlertTriangle, label: "Incidents" },
    { href: "/admin/users", icon: Users, label: "Users" },
];

interface Props { children: React.ReactNode; user?: User | null; title?: string; }

export function AdminShell({ children, user, title }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);

    function logout() {
        clearSession();
        router.push("/today");
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-4 py-5 flex items-center gap-3 border-b border-border">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                    <FlaskConical size={16} className="text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">BioCamp</p>
                    <p className="text-[10px] text-gray-500">Admin Panel</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {NAV.map(({ href, icon: Icon, label }) => {
                    const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
                    return (
                        <Link key={href} href={href} onClick={() => setDrawerOpen(false)}
                            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100")}>
                            <Icon size={17} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User + logout */}
            <div className="px-3 py-4 border-t border-border">
                {user && <p className="text-xs font-semibold text-gray-700 px-2 mb-2 truncate">{user.name} · {user.role}</p>}
                <button onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 w-full transition-colors">
                    <LogOut size={16} /> Sign out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg flex">
            {/* Desktop sidebar */}
            <aside className="hidden md:flex md:w-56 flex-col bg-white border-r border-border shrink-0 fixed inset-y-0">
                <SidebarContent />
            </aside>

            {/* Mobile drawer */}
            {drawerOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    <div className="relative w-64 bg-white h-full shadow-lifted animate-slide-up">
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
                {/* Mobile top bar */}
                <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
                    <button onClick={() => setDrawerOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100" aria-label="Menu">
                        <Menu size={20} className="text-gray-700" />
                    </button>
                    <p className="text-[15px] font-bold text-gray-900">{title || "Admin"}</p>
                    <div className="w-9" />
                </header>

                {/* Desktop top bar */}
                <header className="hidden md:flex sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border px-6 h-14 items-center gap-3">
                    <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ChevronLeft size={18} />
                    </Link>
                    <h1 className="text-[15px] font-bold text-gray-900">{title || "Admin"}</h1>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 md:p-6 max-w-4xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
