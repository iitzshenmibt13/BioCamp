"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "@/lib/query";
import { DevLoginModal } from "./DevLoginModal";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#0F172A",
                        color: "#fff",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 500,
                    },
                    success: { iconTheme: { primary: "#22C55E", secondary: "#fff" } },
                    error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
                }}
            />
            <DevLoginModal />
        </QueryClientProvider>
    );
}
