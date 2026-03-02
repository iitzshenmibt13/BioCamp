"use client";
/**
 * Admin layout – gates all /admin/* pages to staff/admin role only.
 */
import { useEffect, useState, ReactNode } from "react";
import { getStoredUser, getStoredToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard", icon: "🏠" },
    { href: "/admin/schedule", label: "Schedule", icon: "📅" },
    { href: "/admin/game", label: "Game Mode", icon: "🎮" },
    { href: "/admin/points", label: "Points", icon: "🏆" },
    { href: "/admin/homework", label: "Homework", icon: "📝" },
    { href: "/admin/checkin", label: "Check-in", icon: "✅" },
    { href: "/admin/announcements", label: "Announce", icon: "📢" },
    { href: "/admin/photos", label: "Photos", icon: "📸" },
    { href: "/admin/incidents", label: "Incidents", icon: "🚨" },
    { href: "/admin/users", label: "Users", icon: "👥" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = getStoredToken();
        const user = getStoredUser();
        if (!token || !user || !["staff", "admin"].includes(user.role)) {
            setAuthorized(false);
            router.replace("/me");
        } else { setAuthorized(true); }
    }, [router]);

    if (authorized === null) return <div className="flex min-h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!authorized) return null;

    return (
        <div className="flex min-h-screen bg-gray-900">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-56 bg-gray-800 border-r border-gray-700 shrink-0">
                <div className="p-4 border-b border-gray-700">
                    <p className="text-white font-bold text-lg">🧬 Camp Ops</p>
                    <p className="text-gray-400 text-xs">Staff Dashboard</p>
                </div>
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(item => (
                        <Link key={item.href} href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm font-medium">
                            <span>{item.icon}</span><span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-auto">
                {/* Mobile top nav */}
                <div className="md:hidden flex overflow-x-auto bg-gray-800 border-b border-gray-700 px-2 py-1">
                    {NAV_ITEMS.map(item => (
                        <Link key={item.href} href={item.href} className="shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 text-gray-300 hover:text-white text-xs">
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
                <div className="p-4 md:p-6">{children}</div>
            </main>
        </div>
    );
}
