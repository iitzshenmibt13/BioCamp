/**
 * Auth utilities: exchange LIFF idToken -> JWT, persist in localStorage.
 */
import { getLiffIdToken } from "./liff";
import { api } from "./api";

const TOKEN_KEY = "camp_ops_jwt";
const USER_KEY = "camp_ops_user";

export function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): any | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export async function exchangeAndStoreToken(): Promise<{ jwt: string; user: any; role: string; group_id: string | null } | null> {
    const idToken = await getLiffIdToken();
    if (!idToken) return null;
    try {
        const resp = await api.post("/api/auth/line", { idToken });
        const data = resp.data;
        localStorage.setItem(TOKEN_KEY, data.jwt);
        localStorage.setItem(USER_KEY, JSON.stringify({ ...data.user, role: data.role, group_id: data.group_id }));
        return data;
    } catch (e) {
        console.error("Token exchange failed:", e);
        return null;
    }
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isStaff(): boolean {
    const user = getStoredUser();
    return user?.role === "staff" || user?.role === "admin";
}

export function isAdmin(): boolean {
    const user = getStoredUser();
    return user?.role === "admin";
}
