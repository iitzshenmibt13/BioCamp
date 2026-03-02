"use client";
import { useState } from "react";
import { Plus, Star } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS, MOCK_GROUPS, MOCK_USER_ADMIN } from "@/lib/mock";
import { formatRelative, getGroupStyle } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminHomeworkPage() {
    const user = MOCK_USER_ADMIN;
    const [selected, setSelected] = useState(MOCK_ASSIGNMENTS[0]);
    const [grading, setGrading] = useState<string | null>(null);
    const [score, setScore] = useState("");
    const [feedback, setFeedback] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newDue, setNewDue] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    const subs = MOCK_SUBMISSIONS.filter(s => s.assignmentId === selected?.id);

    function submitGrade(subId: string) {
        if (!score) { toast.error("Enter a score."); return; }
        toast.success("Grade saved!");
        setGrading(null);
        setScore(""); setFeedback("");
    }

    return (
        <AdminShell user={user} title="Homework">
            {/* Assignment selector */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
                {MOCK_ASSIGNMENTS.map(a => (
                    <button key={a.id} onClick={() => setSelected(a)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selected?.id === a.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                        {a.title}
                    </button>
                ))}
                <button onClick={() => setShowCreate(v => !v)}
                    className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 flex items-center gap-1">
                    <Plus size={12} /> New
                </button>
            </div>

            {/* Create form */}
            {showCreate && (
                <div className="card p-4 mb-4 space-y-3">
                    <p className="text-sm font-bold">New Assignment</p>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" className="input text-sm" />
                    <input type="datetime-local" value={newDue} onChange={e => setNewDue(e.target.value)} className="input text-sm" />
                    <button onClick={() => { toast.success("Assignment created!"); setShowCreate(false); }} className="btn btn-primary text-sm w-full">Create</button>
                </div>
            )}

            {/* Submissions */}
            {selected && (
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Submissions for {selected.title}</p>
                    {subs.length === 0 ? (
                        <div className="card p-8 text-center text-sm text-gray-400">No submissions yet</div>
                    ) : (
                        <div className="space-y-3">
                            {subs.map(sub => {
                                const gs = getGroupStyle(sub.groupName);
                                return (
                                    <div key={sub.id} className="card p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ background: gs.color }} />
                                                <p className="text-sm font-bold text-gray-900">{sub.groupName}</p>
                                            </div>
                                            <p className="text-xs text-gray-400">{formatRelative(sub.submittedAt)}</p>
                                        </div>
                                        {sub.textContent && <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">{sub.textContent}</p>}
                                        {sub.grade?.isPublished ? (
                                            <div className="flex items-center gap-2">
                                                <Star size={14} className="text-success" fill="currentColor" />
                                                <p className="text-sm font-bold text-success">{sub.grade.score}/{sub.grade.maxScore}</p>
                                                <p className="text-xs text-gray-400">Graded</p>
                                            </div>
                                        ) : grading === sub.id ? (
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <input type="number" value={score} onChange={e => setScore(e.target.value)}
                                                        placeholder={`Score / ${selected.maxScore}`} className="input text-sm flex-1" />
                                                </div>
                                                <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                                                    placeholder="Feedback (optional)" rows={2} className="input text-sm resize-none" />
                                                <div className="flex gap-2">
                                                    <button onClick={() => setGrading(null)} className="btn btn-ghost text-xs flex-1">Cancel</button>
                                                    <button onClick={() => submitGrade(sub.id)} className="btn btn-primary text-xs flex-1">Save Grade</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => setGrading(sub.id)} className="btn btn-soft text-xs w-full">Grade</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </AdminShell>
    );
}
