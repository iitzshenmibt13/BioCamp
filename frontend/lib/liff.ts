/**
 * LIFF initialization and helper utilities.
 * Wraps @line/liff with lazy init + fallback for non-LIFF environments.
 */
"use client";

let liffInitialized = false;

export async function initLiff(): Promise<void> {
    if (liffInitialized) return;
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID!;
    if (!liffId) throw new Error("NEXT_PUBLIC_LIFF_ID not set");
    const liff = (await import("@line/liff")).default;
    await liff.init({ liffId });
    liffInitialized = true;
}

export async function getLiffIdToken(): Promise<string | null> {
    try {
        await initLiff();
        const liff = (await import("@line/liff")).default;
        if (!liff.isLoggedIn()) {
            liff.login();
            return null;
        }
        return liff.getIDToken();
    } catch {
        return null;
    }
}

export async function getLiffProfile() {
    try {
        await initLiff();
        const liff = (await import("@line/liff")).default;
        if (!liff.isLoggedIn()) return null;
        return liff.getProfile();
    } catch {
        return null;
    }
}

export function isInClient(): boolean {
    if (typeof window === "undefined") return false;
    return window.location.href.includes("liff.line.me") || navigator.userAgent.includes("Line/");
}
