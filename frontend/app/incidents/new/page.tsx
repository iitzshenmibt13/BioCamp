"use client";
/** Incident report form for campers (and anon). */
import { useState } from "react";
import { api } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const CATEGORIES = ["health", "safety", "other"] as const;
const SEVERITIES = [
    { value: "low", label: "Low", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    { value: "medium", label: "Medium", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { value: "high", label: "High 🚨", color: "bg-red-100 text-red-700 border-red-300" },
] as const;

export default function IncidentNewPage() {
    const [category, setCategory] = useState("health");
    const [severity, setSeverity] = useState("low");
    const [content, setContent] = useState("");
    const [phone, setPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!content.trim()) { toast.error("Please describe the incident"); return; }
        setSubmitting(true);
        try {
            await api.post("/api/incidents", { category, severity, content, contact_phone: phone || undefined });
            setDone(true);
        } catch { toast.error("Submission failed"); }
        finally { setSubmitting(false); }
    };

    if (done) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 text-center pb-20">
            <div>
                <div className="text-6xl mb-4">✅</div>
                <p className="text-xl font-bold text-gray-800">Report Submitted</p>
                <p className="text-gray-500 text-sm mt-2">Staff have been notified. Thank you for reporting.</p>
                <button onClick={() => router.push("/me")} className="btn-primary mt-6">Back to Profile</button>
            </div>
            <BottomNav active="me" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-gradient-to-br from-red-600 to-orange-500 text-white px-4 pt-10 pb-6">
                <h1 className="text-2xl font-bold">🚨 Report Incident</h1>
                <p className="text-red-100 text-sm mt-1">This report is private — staff only.</p>
            </div>
            <div className="p-4 space-y-4">
                <div>
                    <label className="label">Category</label>
                    <div className="flex gap-2">
                        {CATEGORIES.map(c => (
                            <button key={c} onClick={() => setCategory(c)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize ${category === c ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-200"}`}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="label">Severity</label>
                    <div className="flex gap-2">
                        {SEVERITIES.map(s => (
                            <button key={s.value} onClick={() => setSeverity(s.value)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${severity === s.value ? s.color + " border-2" : "bg-white text-gray-500 border-gray-200"}`}>
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="label">Description *</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Describe what happened..." className="input h-28 resize-none" />
                </div>

                <div>
                    <label className="label">Contact Phone (optional)</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+886..." className="input" />
                </div>

                <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
                    {submitting ? "Submitting..." : "🚨 Submit Report"}
                </button>
            </div>
            <BottomNav active="me" />
        </div>
    );
}
