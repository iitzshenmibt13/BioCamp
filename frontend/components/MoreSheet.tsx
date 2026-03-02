"use client";
import Link from "next/link";
import { Megaphone, QrCode, AlertTriangle, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
    { href: "/announcements", icon: Megaphone, label: "Announcements", desc: "Camp updates & notices" },
    { href: "/checkin", icon: QrCode, label: "QR Check-in", desc: "Scan to check in" },
    { href: "/incident", icon: AlertTriangle, label: "Report Issue", desc: "Health, safety, equipment" },
    { href: "#help", icon: HelpCircle, label: "Help / FAQ", desc: "Frequently asked questions" },
] as const;

interface Props { open: boolean; onClose: () => void; }

export function MoreSheet({ open, onClose }: Props) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="relative w-full bg-white rounded-t-3xl shadow-lifted p-5 pb-8 space-y-3 animate-slide-up" onClick={e => e.stopPropagation()}>
                {/* Handle */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-gray-900">More</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Close">
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>
                {ITEMS.map(({ href, icon: Icon, label, desc }) => (
                    <Link key={label} href={href} onClick={onClose}
                        className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-gray-50 transition-colors group">
                        <div className="w-11 h-11 bg-primary-soft rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                            <Icon size={20} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{label}</p>
                            <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
