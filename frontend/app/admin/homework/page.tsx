"use client";
/** Admin: Homework – create assignments, view submissions, grade with rubric. */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminHomeworkPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: "", instructions: "", max_score: 100, auto_award_points: "" });
    const [gradingId, setGradingId] = useState<string | null>(null);
    const [gradeForm, setGradeForm] = useState({ score: 0, feedback: "", publish: true });

    const loadAssignments = useCallback(async () => {
        const r = await api.get("/api/homework/assignments");
        setAssignments(r.data);
    }, []);

    const loadSubmissions = useCallback(async (aId: string) => {
        const r = await api.get(`/api/homework/submissions?assignment_id=${aId}`);
        setSubmissions(r.data);
    }, []);

    useEffect(() => { loadAssignments(); }, [loadAssignments]);
    useEffect(() => { if (selectedAssignment) loadSubmissions(selectedAssignment); }, [selectedAssignment, loadSubmissions]);

    const createAssignment = async () => {
        try {
            await api.post("/api/homework/assignments", {
                ...form, max_score: Number(form.max_score),
                auto_award_points: form.auto_award_points ? Number(form.auto_award_points) : null
            });
            toast.success("Assignment created!"); setCreating(false); await loadAssignments();
        } catch { toast.error("Failed"); }
    };

    const grade = async (subId: string) => {
        try {
            await api.post("/api/homework/grades", { submission_id: subId, ...gradeForm, score: Number(gradeForm.score) });
            toast.success("Graded!"); setGradingId(null); await loadSubmissions(selectedAssignment!);
        } catch { toast.error("Failed"); }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">📝 Homework Manager</h1>
                <button onClick={() => setCreating(true)} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">+ Assignment</button>
            </div>

            {creating && (
                <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 space-y-3">
                    <p className="text-white font-semibold">New Assignment</p>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                    <textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} placeholder="Instructions" className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm h-24 resize-none" />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" value={form.max_score} onChange={e => setForm({ ...form, max_score: Number(e.target.value) })} placeholder="Max score" className="bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                        <input type="number" value={form.auto_award_points} onChange={e => setForm({ ...form, auto_award_points: e.target.value })} placeholder="Auto-award pts (optional)" className="bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={createAssignment} className="flex-1 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold">Create</button>
                        <button onClick={() => setCreating(false)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
                {/* Assignment list */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                    <p className="px-4 py-3 text-gray-400 text-xs font-semibold uppercase border-b border-gray-700">Assignments</p>
                    {assignments.map(a => (
                        <button key={a.id} onClick={() => setSelectedAssignment(a.id)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-700 last:border-0 transition-colors ${selectedAssignment === a.id ? "bg-gray-700" : "hover:bg-gray-750"}`}>
                            <p className="text-white font-medium text-sm truncate">{a.title}</p>
                            <p className="text-gray-400 text-xs">Max: {a.max_score} pts</p>
                        </button>
                    ))}
                </div>

                {/* Submissions + grading */}
                <div className="md:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                    <p className="px-4 py-3 text-gray-400 text-xs font-semibold uppercase border-b border-gray-700">
                        {selectedAssignment ? `Submissions (${submissions.length})` : "Select an assignment"}
                    </p>
                    {submissions.map(s => (
                        <div key={s.id} className="p-4 border-b border-gray-700 last:border-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-white text-sm font-medium">{s.submitted_by}</p>
                                    <p className="text-gray-400 text-xs">{new Date(s.submitted_at).toLocaleString("zh-TW")}</p>
                                    {s.content_text && <p className="text-gray-300 text-xs mt-1 line-clamp-2">{s.content_text}</p>}
                                    {s.file_url && <a href={s.file_url} target="_blank" rel="noreferrer" className="text-primary-400 text-xs underline">📎 File</a>}
                                </div>
                                <button onClick={() => { setGradingId(s.id); setGradeForm({ score: 0, feedback: "", publish: true }); }}
                                    className="px-3 py-1.5 bg-primary-700 text-primary-200 rounded-lg text-xs shrink-0">Grade</button>
                            </div>
                            {gradingId === s.id && (
                                <div className="mt-3 bg-gray-900 rounded-xl p-3 space-y-2">
                                    <input type="number" value={gradeForm.score} onChange={e => setGradeForm({ ...gradeForm, score: Number(e.target.value) })} placeholder="Score" className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                                    <textarea value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Feedback" className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm h-20 resize-none" />
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={gradeForm.publish} onChange={e => setGradeForm({ ...gradeForm, publish: e.target.checked })} />
                                        <span className="text-gray-300 text-xs">Publish immediately</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <button onClick={() => grade(s.id)} className="flex-1 py-2 bg-green-700 text-green-200 rounded-lg text-xs font-semibold">Save Grade</button>
                                        <button onClick={() => setGradingId(null)} className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-xs">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
