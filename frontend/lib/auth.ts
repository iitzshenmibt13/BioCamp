"use client";
import type { User, AuthSession } from "./types";

const TOKEN_KEY = "camp_token";
const USER_KEY = "camp_user";

export function saveSession(session: AuthSession) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function loadSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const raw = localStorage.getItem(USER_KEY);
        if (!token || !raw) return null;
        const user: User = JSON.parse(raw);
        return { user, token, expiresAt: Date.now() + 86400_000 };
    } catch { return null; }
}

export function clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isStaff(user: User | null): boolean {
    return user?.role === "staff" || user?.role === "admin";
}

export function isAdmin(user: User | null): boolean {
    return user?.role === "admin";
}
