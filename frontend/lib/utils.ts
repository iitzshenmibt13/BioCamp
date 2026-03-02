import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("zh-TW", { month: "short", day: "numeric", weekday: "short" });
}

export function formatRelative(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < -60) return `${Math.round(-diffMin / 60)}h ago`;
    if (diffMin < 0) return `${-diffMin}m ago`;
    if (diffMin === 0) return "now";
    if (diffMin < 60) return `in ${diffMin}m`;
    return `in ${Math.round(diffMin / 60)}h`;
}

export function getProgress(startAt: string, endAt: string): number {
    const now = Date.now();
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
}

/** Map a group name/color to CSS vars */
export const GROUP_COLORS: Record<string, { color: string; bg: string }> = {
    alpha: { color: "#3B82F6", bg: "#EFF6FF" },
    beta: { color: "#22C55E", bg: "#F0FDF4" },
    gamma: { color: "#8B5CF6", bg: "#F5F3FF" },
    delta: { color: "#F97316", bg: "#FFF7ED" },
    epsilon: { color: "#14B8A6", bg: "#F0FDFA" },
    zeta: { color: "#EC4899", bg: "#FDF2F8" },
    eta: { color: "#F59E0B", bg: "#FFFBEB" },
    theta: { color: "#EF4444", bg: "#FEF2F2" },
};

const PALETTE = Object.values(GROUP_COLORS);
export function getGroupStyle(name: string): { color: string; bg: string } {
    const key = name.toLowerCase().replace(/\s+/g, "");
    if (GROUP_COLORS[key]) return GROUP_COLORS[key];
    // Deterministic fallback from name hash
    let hash = 0;
    for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
    return PALETTE[hash % PALETTE.length];
}

export const CATEGORY_ICON: Record<string, string> = {
    game: "🎮", homework: "📝", attendance: "✅", bonus: "⭐", penalty: "❌",
};

export const CATEGORY_COLOR: Record<string, { text: string; bg: string }> = {
    game: { text: "#3B82F6", bg: "#EFF6FF" },
    homework: { text: "#8B5CF6", bg: "#F5F3FF" },
    attendance: { text: "#22C55E", bg: "#F0FDF4" },
    bonus: { text: "#F59E0B", bg: "#FFFBEB" },
    penalty: { text: "#EF4444", bg: "#FEF2F2" },
};
