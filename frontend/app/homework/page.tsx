"use client";
/**
 * Homework page: list assignments, submit text/file, view published grades.
 */
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import AuthGate from "@/components/AuthGate";
import toast from "react-hot-toast";

type Assignment = { id: string; title: string; instructions: string; due_at?: string; max_score: number; scope: string };
type MySubmission = { id: string; assignment_id: string; submitted_at: string; file_url?: string; content_text?: string; grade?: { score: number; feedback?: string; rubric_json?: any[] } };

export default function HomeworkPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [mySubmissions, setMySubmissions] = useState<MySubmission[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [text, setText] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        api.get("/api/homework/assignments").then(r => setAssignments(r.data)).catch(() => { });
        api.get("/api/homework/my-submissions").then(r => setMySubmissions(r.data)).catch(() => { });
    }, []);

    const getMySubmission = (aId: string) => mySubmissions.find(s => s.assignment_id === aId);

    const handleSubmit = async (assignmentId: string) => {
        setSubmitting(true);
        const form = new FormData();
        form.append("assignment_id", assignmentId);
        if (text.trim()) form.append("content_text", text.trim());
        const file = fileRef.current?.files?.[0];
        if (file) form.append("file", file);
        try {
            await api.post("/api/homework/submissions", form, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("Submitted!");
            const newSubs = await api.get("/api/homework/my-submissions");
            setMySubmissions(newSubs.data);
            setText(""); setExpanded(null);
        } catch {
            toast.error("Submission failed");
        } finally { setSubmitting(false); }
    };

    return (
        <AuthGate>
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-500 text-white px-4 pt-10 pb-6">
                    <h1 className="text-2xl font-bold">📝 Homework</h1>
                </div>
                <div className="p-4 space-y-3">
                    {assignments.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No assignments yet.</p>
                    ) : assignments.map(a => {
                        const sub = getMySubmission(a.id);
                        const overdue = a.due_at && new Date(a.due_at) < new Date();
                        return (
                            <div key={a.id} className="card">
                                <button className="w-full text-left p-4" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{a.title}</p>
                                            {a.due_at && <p className={`text-xs mt-0.5 ${overdue ? "text-red-500" : "text-gray-400"}`}>Due: {new Date(a.due_at).toLocaleDateString("zh-TW")}</p>}
                                        </div>
                                        <span className={`badge shrink-0 ${sub ? (sub.grade ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700") : "bg-gray-100 text-gray-500"}`}>
                                            {sub ? (sub.grade ? `${sub.grade.score}/${a.max_score}` : "Submitted") : "Pending"}
                                        </span>
                                    </div>
                                </button>
                                {expanded === a.id && (
                                    <div className="border-t border-gray-100 p-4 space-y-3">
                                        {a.instructions && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{a.instructions}</p>}

                                        {/* Grade feedback */}
                                        {sub?.grade && (
                                            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                                                <p className="font-semibold text-green-700">Score: {sub.grade.score}/{a.max_score}</p>
                                                {sub.grade.feedback && <p className="text-sm text-green-600 mt-1">{sub.grade.feedback}</p>}
                                                {sub.grade.rubric_json?.map((r: any, i: number) => (
                                                    <p key={i} className="text-xs text-green-600 mt-1">{r.criterion}: {r.score}/{r.max}</p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Submission form */}
                                        {!sub && (
                                            <div className="space-y-2">
                                                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write your answer..." className="input h-24 resize-none" />
                                                <div>
                                                    <label className="label">Or upload a file (PDF/image)</label>
                                                    <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="text-sm text-gray-600" />
                                                </div>
                                                <button onClick={() => handleSubmit(a.id)} disabled={submitting} className="btn-primary w-full">
                                                    {submitting ? "Submitting..." : "Submit"}
                                                </button>
                                            </div>
                                        )}
                                        {sub && !sub.grade && (
                                            <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">✓ Submitted – awaiting grade.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <BottomNav active="homework" />
            </div>
        </AuthGate>
    );
}
