// AuthGate is no longer used in the new frontend.
// LIFF initialization now happens in lib/liff.ts with dev-mode fallback.
// This file is kept as a stub to avoid import errors from old code.
export function AuthGate({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
