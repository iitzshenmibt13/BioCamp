"use client";
import { useState } from "react";
import { CamperLayout } from "@/components/CamperLayout";
import { AssignmentCard } from "@/components/AssignmentCard";
import { EmptyState } from "@/components/EmptyState";
import { MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS, MOCK_USER_CAMPER } from "@/lib/mock";
import { ClipboardList } from "lucide-react";

const TABS = ["Assigned", "Submitted", "Graded"] as const;

export default function HomeworkPage() {
    const user = MOCK_USER_CAMPER;
    const [tab, setTab] = useState<typeof TABS[number]>("Assigned");

    const mySubmissions = MOCK_SUBMISSIONS.filter(s => s.groupId === user.groupId);

    const displayed = MOCK_ASSIGNMENTS.filter(a => {
        const sub = mySubmissions.find(s => s.assignmentId === a.id);
        if (tab === "Submitted") return sub && !sub.grade?.isPublished;
        if (tab === "Graded") return sub?.grade?.isPublished;
        return !sub; // Assigned = not yet submitted
    });

    return (
        <CamperLayout title="Homework" user={user}>
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${tab === t ? "bg-white text-gray-900 shadow-soft" : "text-gray-500"}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* List */}
            {displayed.length === 0 ? (
                <EmptyState icon={ClipboardList}
                    title={tab === "Assigned" ? "All caught up!" : tab === "Submitted" ? "Nothing awaiting grading" : "No grades yet"}
                    description={tab === "Assigned" ? "No pending assignments right now." : undefined} />
            ) : (
                <div className="space-y-3">
                    {displayed.map(a => (
                        <AssignmentCard key={a.id} assignment={a} submission={mySubmissions.find(s => s.assignmentId === a.id)} />
                    ))}
                </div>
            )}
        </CamperLayout>
    );
}
