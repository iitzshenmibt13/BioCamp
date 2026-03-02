"use client";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 30,          // 30s default stale time
            gcTime: 1000 * 60 * 5,         // 5min cache
            retry: 1,
            refetchOnWindowFocus: true,
        },
    },
});

// Query keys
export const QK = {
    schedule: ["schedule"] as const,
    leaderboard: ["leaderboard"] as const,
    transactions: (groupId: string) => ["transactions", groupId] as const,
    allTransactions: ["allTransactions"] as const,
    assignments: ["assignments"] as const,
    assignment: (id: string) => ["assignment", id] as const,
    submissions: (assignmentId?: string) => ["submissions", assignmentId] as const,
    announcements: ["announcements"] as const,
    photos: ["photos"] as const,
    incidents: ["incidents"] as const,
    checkpoints: ["checkpoints"] as const,
    checkins: ["checkins"] as const,
    me: ["me"] as const,
    groups: ["groups"] as const,
};
