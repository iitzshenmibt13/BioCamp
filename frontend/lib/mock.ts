import { addHours, addMinutes, startOfDay, subHours, subMinutes } from "date-fns";
import type {
    Group, User, ScheduleItem, PointTransaction, Assignment,
    Submission, Announcement, Photo, Incident, Checkpoint, Checkin,
} from "./types";

// Set "now" as 9:15 AM so DNA lab is currently happening
const today = startOfDay(new Date());
const now = addHours(today, 9.25); // 9:15 AM

const t = (h: number, m = 0) => addMinutes(addHours(today, h), m).toISOString();

// ─── GROUPS ───────────────────────────────────────────────────
export const MOCK_GROUPS: Group[] = [
    { id: "g1", name: "Team Alpha", color: "#3B82F6", joinCode: "ALPHA", totalPoints: 1480, todayPoints: 180, memberCount: 8 },
    { id: "g2", name: "Team Beta", color: "#22C55E", joinCode: "BETA", totalPoints: 1250, todayPoints: 120, memberCount: 7 },
    { id: "g3", name: "Team Gamma", color: "#8B5CF6", joinCode: "GAMMA", totalPoints: 1180, todayPoints: 95, memberCount: 8 },
    { id: "g4", name: "Team Delta", color: "#F97316", joinCode: "DELTA", totalPoints: 980, todayPoints: 80, memberCount: 7 },
];

// ─── USERS ────────────────────────────────────────────────────
export const MOCK_USER_CAMPER: User = {
    id: "u1", name: "Alex Chen", role: "camper",
    groupId: "g1", groupName: "Team Alpha", groupColor: "#3B82F6",
    avatarUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=alex`,
};
export const MOCK_USER_STAFF: User = {
    id: "u2", name: "Dr. Lin", role: "staff",
    groupId: null,
    avatarUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=lin`,
};
export const MOCK_USER_ADMIN: User = {
    id: "u3", name: "Admin", role: "admin",
    groupId: null,
    avatarUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=admin`,
};

// ─── SCHEDULE ─────────────────────────────────────────────────
export const MOCK_SCHEDULE: ScheduleItem[] = [
    {
        id: "s1", title: "Opening Ceremony", tags: ["talk"], isPublished: true,
        startAt: t(8, 30), endAt: t(9, 0),
        locationText: "Main Hall", description: "Welcome to BioCamp 2026! Meet the staff and fellow campers.",
    },
    {
        id: "s2", title: "DNA Extraction Lab", tags: ["experiment"], isPublished: true,
        startAt: t(9, 0), endAt: t(12, 0),
        locationText: "Lab A", mapsUrl: "https://maps.google.com",
        description: "Extract DNA from strawberries and visualize with ethanol precipitation.",
        hasCheckin: true, checkpointId: "cp1",
    },
    {
        id: "s3", title: "Lunch Break", tags: ["break"], isPublished: true,
        startAt: t(12, 0), endAt: t(13, 0),
        locationText: "Cafeteria", description: "Enjoy lunch and rest.",
    },
    {
        id: "s4", title: "Microscopy Challenge", tags: ["game"], isPublished: true,
        startAt: t(13, 0), endAt: t(15, 0),
        locationText: "Lab B", mapsUrl: "https://maps.google.com",
        description: "Teams compete to identify specimens under the microscope. Points awarded!",
        hasCheckin: true, checkpointId: "cp2",
    },
    {
        id: "s5", title: "Group Presentations", tags: ["talk"], isPublished: true,
        startAt: t(15, 0), endAt: t(16, 30),
        locationText: "Main Hall",
        description: "Each group presents their findings from today's experiments.",
    },
    {
        id: "s6", title: "Evening Keynote: AI in Biology", tags: ["talk"], isPublished: true,
        startAt: t(19, 0), endAt: t(20, 0),
        locationText: "Auditorium", mapsUrl: "https://maps.google.com",
        description: "Special talk by Dr. Sarah Wu on using AI for genomic research.",
    },
];

// ─── POINT TRANSACTIONS ───────────────────────────────────────
export const MOCK_TRANSACTIONS: PointTransaction[] = [
    { id: "tx1", groupId: "g1", groupName: "Team Alpha", groupColor: "#3B82F6", deltaPoints: 120, category: "game", reason: "Win – Microscopy Round 1", createdByName: "Dr. Lin", createdAt: t(13, 45), isReversed: false },
    { id: "tx2", groupId: "g2", groupName: "Team Beta", groupColor: "#22C55E", deltaPoints: 80, category: "game", reason: "Win – Microscopy Round 1", createdByName: "Dr. Lin", createdAt: t(13, 46), isReversed: false },
    { id: "tx3", groupId: "g3", groupName: "Team Gamma", groupColor: "#8B5CF6", deltaPoints: 50, category: "bonus", reason: "Perfect lab safety score", createdByName: "Ms. Wang", createdAt: t(11, 0), isReversed: false },
    { id: "tx4", groupId: "g1", groupName: "Team Alpha", groupColor: "#3B82F6", deltaPoints: 100, category: "homework", reason: "Assignment 1 graded", createdByName: "Dr. Lin", createdAt: t(8, 0), isReversed: false },
    { id: "tx5", groupId: "g4", groupName: "Team Delta", groupColor: "#F97316", deltaPoints: -20, category: "penalty", reason: "Late submission", createdByName: "Ms. Wang", createdAt: t(7, 30), isReversed: false },
    { id: "tx6", groupId: "g2", groupName: "Team Beta", groupColor: "#22C55E", deltaPoints: 30, category: "attendance", reason: "Full attendance Day 1", createdByName: "Dr. Lin", createdAt: subHours(today, 18).toISOString(), isReversed: true, reversedAt: t(8, 10) },
];

// ─── HOMEWORK ─────────────────────────────────────────────────
export const MOCK_ASSIGNMENTS: Assignment[] = [
    {
        id: "a1", title: "DNA Extraction Report",
        instructions: "Write a 500-word report on the DNA extraction procedure. Include the chemical equations for each step and annotate your observations with diagrams. Submit by tonight.",
        dueAt: t(22, 0), maxScore: 100, targetGroupId: null,
    },
    {
        id: "a2", title: "Microscopy Identification Quiz",
        instructions: "Identify the 10 specimens shown in the provided images. For each, provide the name and key identifying features.",
        dueAt: t(14, 0), maxScore: 50, targetGroupId: null,
    },
    {
        id: "a3", title: "Pre-camp Reading Summary",
        instructions: "Summarize Chapter 3 of the BioCamp handbook (Cell Biology Basics).",
        dueAt: subHours(today, 12).toISOString(), maxScore: 30, targetGroupId: null,
    },
];

export const MOCK_SUBMISSIONS: Submission[] = [
    {
        id: "sub1", assignmentId: "a3", groupId: "g1", groupName: "Team Alpha", groupColor: "#3B82F6",
        textContent: "Chapter 3 covers the fundamentals of cell biology including membrane structure, organelle functions, and cellular respiration pathways...",
        submittedAt: subHours(today, 14).toISOString(),
        grade: {
            id: "gr1", submissionId: "sub1", score: 27, maxScore: 30,
            feedback: "Excellent summary! Great detail on membrane structure. Could expand more on cellular respiration.",
            rubric: [
                { criterion: "Content Accuracy", score: 9, maxScore: 10 },
                { criterion: "Clarity", score: 9, maxScore: 10 },
                { criterion: "Completeness", score: 9, maxScore: 10 },
            ],
            isPublished: true, gradedAt: subHours(today, 6).toISOString(),
        },
    },
];

// ─── ANNOUNCEMENTS ────────────────────────────────────────────
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: "ann1", title: "📍 Lab Safety Reminder", isPinned: true, target: "all",
        content: "Reminder: always wear goggles and gloves in Lab A and Lab B. No open-toed shoes. Safety equipment is available at the entrance.",
        createdAt: t(7, 0), createdByName: "Dr. Lin",
    },
    {
        id: "ann2", title: "Schedule Change: Keynote moved to Auditorium", isPinned: false, target: "all",
        content: "The evening keynote has been moved to the main auditorium due to higher-than-expected attendance. Please check your updated schedules.",
        createdAt: t(8, 15), createdByName: "Ms. Wang",
    },
    {
        id: "ann3", title: "WiFi Password Updated", isPinned: false, target: "all",
        content: "The camp WiFi password has been updated to: BioC@mp2026!\nApplies to the CampGuest network.",
        createdAt: subHours(today, 20).toISOString(), createdByName: "Admin",
    },
];

// ─── PHOTOS ───────────────────────────────────────────────────
export const MOCK_PHOTOS: Photo[] = [
    { id: "ph1", url: "https://images.unsplash.com/photo-1532094349884-543559127de5?w=400&q=80", caption: "DNA extraction in action! 🧬", isPublished: true, likeCount: 12, hasLiked: false, takenAt: t(10, 30), uploadedByName: "Dr. Lin" },
    { id: "ph2", url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&q=80", caption: "Team Alpha concentrated at the microscope", isPublished: true, likeCount: 8, hasLiked: true, takenAt: t(9, 15), uploadedByName: "Ms. Wang" },
    { id: "ph3", url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80", caption: "Opening ceremony energy! ⚡", isPublished: true, likeCount: 20, hasLiked: false, takenAt: t(8, 35), uploadedByName: "Admin" },
    { id: "ph4", url: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=400&q=80", caption: "Beautiful strawberry DNA results 🍓", isPublished: true, likeCount: 15, hasLiked: false, takenAt: t(11, 0), uploadedByName: "Dr. Lin" },
];

// ─── INCIDENTS ────────────────────────────────────────────────
export const MOCK_INCIDENTS: Incident[] = [
    { id: "inc1", category: "health", severity: "low", content: "Minor cut on finger while handling glassware. First aid applied.", status: "resolved", createdAt: t(10, 45), reportedByName: "Ms. Wang", internalNotes: "Bandaged. No stitches needed. Student is fine." },
    { id: "inc2", category: "equipment", severity: "medium", content: "Microscope #3 not focusing correctly, seems like objective lens is damaged.", status: "triaged", createdAt: t(13, 20), reportedByName: "Dr. Lin", internalNotes: "Tagged for repair. Students moved to scope #5." },
];

// ─── CHECKPOINTS ──────────────────────────────────────────────
export const MOCK_CHECKPOINTS: Checkpoint[] = [
    { id: "cp1", scheduleItemId: "s2", scheduleItemTitle: "DNA Extraction Lab", pointsAwarded: 10, qrPayload: "camp:checkin:cp1:abc123", expiresAt: t(12, 0) },
    { id: "cp2", scheduleItemId: "s4", scheduleItemTitle: "Microscopy Challenge", pointsAwarded: 15, qrPayload: "camp:checkin:cp2:def456", expiresAt: t(15, 0) },
];

export const MOCK_CHECKINS: Checkin[] = [
    { id: "ci1", userId: "u1", userName: "Alex Chen", groupId: "g1", groupName: "Team Alpha", checkpointId: "cp1", checkpointTitle: "DNA Extraction Lab", pointsAwarded: 10, checkedInAt: t(9, 5) },
];
