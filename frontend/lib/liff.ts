"use client";
/**
 * LIFF initialization with dev-mode fallback.
 * In production: uses LINE LIFF SDK.
 * In dev (no LIFF): shows a role/group selector stored in localStorage.
 */

import type { User } from "./types";
import { MOCK_GROUPS, MOCK_USER_ADMIN, MOCK_USER_CAMPER, MOCK_USER_STAFF } from "./mock";

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "";
const DEV_SESSION_KEY = "camp_dev_session";

export interface LiffProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    idToken: string;
}

let liffInitialized = false;

export async function initLiff(): Promise<boolean> {
    if (liffInitialized) return true;
    if (!LIFF_ID || typeof window === "undefined") return false;
    try {
        const liff = (await import("@line/liff")).default;
        await liff.init({ liffId: LIFF_ID });
        liffInitialized = true;
        return true;
    } catch {
        return false;
    }
}

export async function getLiffProfile(): Promise<LiffProfile | null> {
    if (!LIFF_ID) return null;
    try {
        const liff = (await import("@line/liff")).default;
        if (!liff.isLoggedIn()) { liff.login(); return null; }
        const profile = await liff.getProfile();
        const idToken = liff.getIDToken() || "";
        return { userId: profile.userId, displayName: profile.displayName, pictureUrl: profile.pictureUrl, idToken };
    } catch { return null; }
}

// ─── Dev mode helpers ──────────────────────────────────────────

export interface DevSession {
    role: "camper" | "staff" | "admin";
    groupId: string | null;
}

export function getDevSession(): DevSession | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(DEV_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function setDevSession(session: DevSession) {
    if (typeof window === "undefined") return;
    localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
}

export function clearDevSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DEV_SESSION_KEY);
}

export function devSessionToUser(session: DevSession): User {
    const group = MOCK_GROUPS.find(g => g.id === session.groupId) || null;
    if (session.role === "admin") {
        return { ...MOCK_USER_ADMIN, groupId: null };
    }
    if (session.role === "staff") {
        return { ...MOCK_USER_STAFF, groupId: null };
    }
    return {
        ...MOCK_USER_CAMPER,
        groupId: group?.id || "g1",
        groupName: group?.name || "Team Alpha",
        groupColor: group?.color || "#3B82F6",
    };
}

export const DEV_MOCK_TOKEN = "dev-mock-token-local";
