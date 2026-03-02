"use client";
/**
 * AuthGate: initializes LIFF, exchanges token, redirects to login if needed.
 */
import { useEffect, useState, ReactNode } from "react";
import { exchangeAndStoreToken, getStoredToken } from "@/lib/auth";

export default function AuthGate({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const existing = getStoredToken();
        if (existing) { setReady(true); return; }
        exchangeAndStoreToken().then((result) => {
            if (result) setReady(true);
            else setError("Sign in via LINE to continue.");
        }).catch(() => setError("Authentication failed. Please reopen in LINE."));
    }, []);

    if (error) return (
        <div className="flex min-h-screen items-center justify-center p-8 text-center">
            <div>
                <div className="text-5xl mb-4">🔒</div>
                <p className="text-gray-600">{error}</p>
            </div>
        </div>
    );
    if (!ready) return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        </div>
    );
    return <>{children}</>;
}
