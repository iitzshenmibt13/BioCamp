"use client";
import Link from "next/link";

const tabs = [
    { key: "schedule", label: "Schedule", icon: "📅", href: "/schedule/today" },
    { key: "points", label: "Points", icon: "🏆", href: "/points" },
    { key: "homework", label: "Homework", icon: "📝", href: "/homework" },
    { key: "announcements", label: "News", icon: "📢", href: "/announcements" },
    { key: "me", label: "Me", icon: "👤", href: "/me" },
];

export default function BottomNav({ active }: { active: string }) {
    return (
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 safe-bottom z-50">
            <div className="flex">
                {tabs.map((tab) => (
                    <Link key={tab.key} href={tab.href} className={`nav-tab flex-1 ${active === tab.key ? "active" : ""}`}>
                        <span className="text-xl">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
