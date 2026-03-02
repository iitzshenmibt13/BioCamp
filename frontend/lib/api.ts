/**
 * Typed API client.
 * Base URL from NEXT_PUBLIC_API_BASE_URL env var.
 * All functions accept an optional token for auth.
 * Swap mock → real by calling the real API in each function.
 */

import type {
    User, Group, ScheduleItem, PointTransaction, Assignment,
    Submission, Grade, Announcement, Photo, Incident, Checkpoint, Checkin,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request<T>(
    path: string,
    options: RequestInit = {},
    token?: string,
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    };
    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
    lineLogin: (idToken: string) =>
        request<{ access_token: string }>("/api/auth/line", {
            method: "POST",
            body: JSON.stringify({ id_token: idToken }),
        }),
    me: (token: string) => request<User>("/api/auth/me", {}, token),
};

// ─── Groups ────────────────────────────────────────────────────
export const groupsApi = {
    list: (token: string) => request<Group[]>("/api/groups", {}, token),
    create: (token: string, data: { name: string; color: string; join_code?: string }) =>
        request<Group>("/api/groups", { method: "POST", body: JSON.stringify(data) }, token),
};

// ─── Schedule ─────────────────────────────────────────────────
export const scheduleApi = {
    list: (token: string) => request<ScheduleItem[]>("/api/schedule", {}, token),
    create: (token: string, data: Partial<ScheduleItem>) =>
        request<ScheduleItem>("/api/schedule", { method: "POST", body: JSON.stringify(data) }, token),
    update: (token: string, id: string, data: Partial<ScheduleItem>) =>
        request<ScheduleItem>(`/api/schedule/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),
    delete: (token: string, id: string) =>
        request<void>(`/api/schedule/${id}`, { method: "DELETE" }, token),
    publish: (token: string, id: string) =>
        request<ScheduleItem>(`/api/schedule/${id}/publish`, { method: "POST" }, token),
};

// ─── Points ────────────────────────────────────────────────────
export const pointsApi = {
    leaderboard: (token: string) => request<Group[]>("/api/points/leaderboard", {}, token),
    transactions: (token: string, groupId: string) =>
        request<PointTransaction[]>(`/api/points/group/${groupId}/transactions`, {}, token),
    allTransactions: (token: string) =>
        request<PointTransaction[]>("/api/points/transactions", {}, token),
    create: (token: string, data: { group_id: string; delta_points: number; category: string; reason: string }) =>
        request<PointTransaction>("/api/points/transactions", { method: "POST", body: JSON.stringify(data) }, token),
    undo: (token: string, txId: string) =>
        request<PointTransaction>(`/api/points/transactions/${txId}/undo`, { method: "POST" }, token),
};

// ─── Homework ──────────────────────────────────────────────────
export const homeworkApi = {
    assignments: (token: string) => request<Assignment[]>("/api/homework/assignments", {}, token),
    assignment: (token: string, id: string) => request<Assignment>(`/api/homework/assignments/${id}`, {}, token),
    submissions: (token: string, assignmentId?: string) =>
        request<Submission[]>(`/api/homework/submissions${assignmentId ? `?assignment_id=${assignmentId}` : ""}`, {}, token),
    submit: (token: string, data: FormData) =>
        request<Submission>("/api/homework/submissions", { method: "POST", body: data, headers: {} }, token),
    grade: (token: string, submissionId: string, data: Partial<Grade>) =>
        request<Grade>(`/api/homework/submissions/${submissionId}/grade`, { method: "POST", body: JSON.stringify(data) }, token),
    createAssignment: (token: string, data: Partial<Assignment>) =>
        request<Assignment>("/api/homework/assignments", { method: "POST", body: JSON.stringify(data) }, token),
};

// ─── Announcements ─────────────────────────────────────────────
export const announcementsApi = {
    list: (token: string) => request<Announcement[]>("/api/announcements", {}, token),
    create: (token: string, data: { title: string; content: string; target: string; is_pinned: boolean }) =>
        request<Announcement>("/api/announcements", { method: "POST", body: JSON.stringify(data) }, token),
    delete: (token: string, id: string) =>
        request<void>(`/api/announcements/${id}`, { method: "DELETE" }, token),
    pin: (token: string, id: string, pinned: boolean) =>
        request<Announcement>(`/api/announcements/${id}/pin?pinned=${pinned}`, { method: "PATCH" }, token),
};

// ─── Photos ────────────────────────────────────────────────────
export const photosApi = {
    list: (token: string) => request<Photo[]>("/api/photos", {}, token),
    upload: (token: string, data: FormData) =>
        request<Photo>("/api/photos", { method: "POST", body: data, headers: {} }, token),
    publish: (token: string, id: string, published: boolean) =>
        request<Photo>(`/api/photos/${id}`, undefined, token),
    like: (token: string, id: string) =>
        request<Photo>(`/api/photos/${id}/like`, { method: "POST" }, token),
};

// ─── Incidents ─────────────────────────────────────────────────
export const incidentsApi = {
    list: (token: string) => request<Incident[]>("/api/incidents", {}, token),
    create: (token: string, data: { category: string; severity: string; content: string; contact_phone?: string }) =>
        request<Incident>("/api/incidents", { method: "POST", body: JSON.stringify(data) }, token),
    update: (token: string, id: string, data: { status: string; internal_notes?: string }) =>
        request<Incident>(`/api/incidents/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),
};

// ─── Check-in ──────────────────────────────────────────────────
export const checkinApi = {
    scan: (token: string, qrPayload: string) =>
        request<{ checkpoint: Checkpoint; points_awarded: number }>("/api/checkin/scan", { method: "POST", body: JSON.stringify({ qr_payload: qrPayload }) }, token),
    createCheckpoint: (token: string, data: { schedule_item_id: string; points_awarded: number; expires_at?: string }) =>
        request<Checkpoint>("/api/checkin/checkpoints", { method: "POST", body: JSON.stringify(data) }, token),
    checkpoints: (token: string) => request<Checkpoint[]>("/api/checkin/checkpoints", {}, token),
    list: (token: string) => request<Checkin[]>("/api/checkin", {}, token),
};
