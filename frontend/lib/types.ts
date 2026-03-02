// ─── User & Auth ──────────────────────────────────────────────
export type UserRole = "camper" | "staff" | "admin";

export interface User {
    id: string;
    name: string;
    lineUserId?: string;
    avatarUrl?: string;
    role: UserRole;
    groupId: string | null;
    groupName?: string;
    groupColor?: string;
}

// ─── Group ────────────────────────────────────────────────────
export interface Group {
    id: string;
    name: string;
    color: string;       // hex
    joinCode: string;
    totalPoints: number;
    todayPoints?: number;
    memberCount?: number;
}

// ─── Schedule ─────────────────────────────────────────────────
export interface ScheduleItem {
    id: string;
    title: string;
    startAt: string;     // ISO
    endAt: string;       // ISO
    locationText?: string;
    mapsUrl?: string;
    description?: string;
    tags: string[];
    isPublished: boolean;
    hasCheckin?: boolean;
    checkpointId?: string;
}

// ─── Points ───────────────────────────────────────────────────
export type PointCategory = "game" | "homework" | "attendance" | "bonus" | "penalty";

export interface PointTransaction {
    id: string;
    groupId: string;
    groupName: string;
    groupColor: string;
    deltaPoints: number;
    category: PointCategory;
    reason: string;
    createdByName: string;
    createdAt: string;   // ISO
    isReversed: boolean;
    reversedAt?: string;
}

// ─── Homework ─────────────────────────────────────────────────
export interface Assignment {
    id: string;
    title: string;
    instructions: string;
    dueAt: string;       // ISO
    maxScore: number;
    targetGroupId?: string | null;
}

export interface RubricScore {
    criterion: string;
    score: number;
    maxScore: number;
}

export interface Grade {
    id: string;
    submissionId: string;
    score: number;
    maxScore: number;
    feedback?: string;
    rubric?: RubricScore[];
    isPublished: boolean;
    gradedAt: string;
}

export interface Submission {
    id: string;
    assignmentId: string;
    groupId: string;
    groupName: string;
    groupColor: string;
    textContent?: string;
    fileUrl?: string;
    submittedAt: string;
    grade?: Grade;
}

// ─── Announcements ────────────────────────────────────────────
export interface Announcement {
    id: string;
    title: string;
    content: string;
    target: "all" | "staff";
    isPinned: boolean;
    createdAt: string;
    createdByName: string;
}

// ─── Photos ───────────────────────────────────────────────────
export interface Photo {
    id: string;
    url: string;
    caption?: string;
    isPublished: boolean;
    likeCount: number;
    hasLiked?: boolean;
    takenAt: string;
    uploadedByName: string;
}

// ─── Incidents ────────────────────────────────────────────────
export type IncidentSeverity = "low" | "medium" | "high";
export type IncidentCategory = "health" | "safety" | "behavior" | "equipment" | "other";
export type IncidentStatus = "new" | "triaged" | "resolved";

export interface Incident {
    id: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    content: string;
    contactPhone?: string;
    status: IncidentStatus;
    internalNotes?: string;
    createdAt: string;
    reportedByName: string;
}

// ─── Check-in ─────────────────────────────────────────────────
export interface Checkpoint {
    id: string;
    scheduleItemId: string;
    scheduleItemTitle: string;
    pointsAwarded: number;
    expiresAt?: string;
    qrPayload: string;
}

export interface Checkin {
    id: string;
    userId: string;
    userName: string;
    groupId: string;
    groupName: string;
    checkpointId: string;
    checkpointTitle: string;
    pointsAwarded: number;
    checkedInAt: string;
}

// ─── Auth session ─────────────────────────────────────────────
export interface AuthSession {
    user: User;
    token: string;
    expiresAt: number;
}
