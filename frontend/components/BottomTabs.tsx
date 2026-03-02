"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, TrendingUp, ClipboardList, Home, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MoreSheet } from "./MoreSheet";

const TABS = [
    { href: "/today", label: "Today", icon: Home },
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/points", label: "Points", icon: TrendingUp },
    { href: "/homework", label: "Homework", icon: ClipboardList },
] as const;

export function BottomTabs() {
    const pathname = usePathname();
    const [moreOpen, setMoreOpen] = useState(false);

    return (
        <>
            <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-border/60 pb-safe">
                <div className="flex items-stretch h-16">
                    {TABS.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Link key={href} href={href}
                                className={cn("flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors relative",
                                    active ? "text-primary" : "text-gray-400 hover:text-gray-600")}>
                                {active && <span className="absolute top-0 inset-x-[30%] h-0.5 bg-primary rounded-full" />}
                                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                                {label}
                            </Link>
                        );
                    })}
                    {/* More tab */}
                    <button onClick={() => setMoreOpen(true)}
                        className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={20} strokeWidth={1.8} />
                        More
                    </button>
                </div>
            </nav>
            <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
        </>
    );
}
