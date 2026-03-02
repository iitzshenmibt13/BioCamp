"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Upload, Send, Star } from "lucide-react";
import { CamperLayout } from "@/components/CamperLayout";
import { EmptyState } from "@/components/EmptyState";
import { MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS, MOCK_USER_CAMPER } from "@/lib/mock";
import { formatRelative } from "@/lib/utils";
import toast from "react-hot-toast";
import { ClipboardList } from "lucide-react";

export default function HomeworkDetailPage() {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const user = MOCK_USER_CAMPER;
    const assignment = MOCK_ASSIGNMENTS.find(a => a.id === assignmentId);
    const submission = MOCK_SUBMISSIONS.find(s => s.assignmentId === assignmentId && s.groupId === user.groupId);

    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!assignment) return (
        <CamperLayout title="Not Found" user={user}>
            <EmptyState icon={ClipboardList} title="Assignment not found" action={<Link href="/homework" className="btn btn-primary">Back to Homework</Link>} />
        </CamperLayout>
    );

    async function handleSubmit() {
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 800));
        setSubmitting(false);
        toast.success("Submitted successfully!");
    }

    return (
        <CamperLayout title={assignment.title} user={user}>
            {/* Back */}
            <Link href="/homework" className="inline-flex items-center gap-1 text-sm text-primary font-semibold -ml-1">
                <ChevronLeft size={16} /> Homework
            </Link>

            {/* Instructions */}
            <div className="card p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Instructions</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{assignment.instructions}</p>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-gray-500">Due: {formatRelative(assignment.dueAt)}</span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className="text-xs text-gray-500">Max: {assignment.maxScore} pts</span>
                </div>
            </div>

            {/* Grade (if published) */}
            {submission?.grade?.isPublished && (
                <div className="card p-4 bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Star size={16} className="text-success" fill="currentColor" />
                        <p className="text-sm font-bold text-success">Grade Published</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{submission.grade.score}<span className="text-base font-normal text-gray-500">/{submission.grade.maxScore}</span></p>
                    {submission.grade.rubric && (
                        <div className="mt-3 space-y-2">
                            {submission.grade.rubric.map(r => (
                                <div key={r.criterion}>
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>{r.criterion}</span>
                                        <span className="font-semibold">{r.score}/{r.maxScore}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-success rounded-full" style={{ width: `${(r.score / r.maxScore) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {submission.grade.feedback && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs font-semibold text-gray-500 mb-1">Feedback</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{submission.grade.feedback}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Submit section */}
            {!submission && (
                <div className="card p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Your Submission</p>
                    <textarea value={text} onChange={e => setText(e.target.value)}
                        placeholder="Write your response here…"
                        rows={5} className="input resize-none text-sm" />
                    <button className="btn btn-ghost w-full mt-2 text-sm gap-2 justify-center">
                        <Upload size={15} /> Attach File
                    </button>
                    <button onClick={handleSubmit} disabled={!text.trim() || submitting}
                        className="btn btn-primary w-full mt-2 gap-2 disabled:opacity-50">
                        <Send size={15} /> {submitting ? "Submitting…" : "Submit"}
                    </button>
                </div>
            )}

            {submission && !submission.grade?.isPublished && (
                <div className="card p-4 text-center">
                    <p className="text-sm font-semibold text-gray-600">✅ Submitted</p>
                    <p className="text-xs text-gray-400 mt-1">Awaiting grading</p>
                </div>
            )}
        </CamperLayout>
    );
}
