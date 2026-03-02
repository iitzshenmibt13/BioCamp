"use client";
import { useState } from "react";
import { Shield, Send, CheckCircle2 } from "lucide-react";
import { CamperLayout } from "@/components/CamperLayout";
import { MOCK_USER_CAMPER } from "@/lib/mock";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const CATEGORIES = [
    { value: "health", label: "🏥 Health", desc: "Injury, illness, allergy" },
    { value: "safety", label: "⚠️ Safety", desc: "Hazard, accident risk" },
    { value: "behavior", label: "🤝 Behavior", desc: "Conflict, misconduct" },
    { value: "equipment", label: "🔧 Equipment", desc: "Broken or missing gear" },
    { value: "other", label: "📋 Other", desc: "Anything else" },
] as const;

const SEVERITIES = [
    { value: "low", label: "Low", color: "text-green-600 bg-green-50 border-green-200" },
    { value: "medium", label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-200" },
    { value: "high", label: "High", color: "text-red-600 bg-red-50 border-red-200" },
] as const;

export default function IncidentPage() {
    const user = MOCK_USER_CAMPER;
    const [category, setCategory] = useState<string>("");
    const [severity, setSeverity] = useState<string>("");
    const [content, setContent] = useState("");
    const [phone, setPhone] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        if (!category || !severity || !content.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 900));
        setSubmitting(false);
        setSubmitted(true);
    }

    if (submitted) return (
        <CamperLayout title="Report Submitted" user={user}>
            <div className="flex flex-col items-center py-12 text-center gap-4">
                <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-success" strokeWidth={1.5} />
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-900">Report Received</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">
                        Thank you for letting us know. A staff member will respond as soon as possible.
                    </p>
                </div>
                <button onClick={() => { setSubmitted(false); setCategory(""); setSeverity(""); setContent(""); setPhone(""); }}
                    className="btn btn-ghost text-sm">Submit Another</button>
            </div>
        </CamperLayout>
    );

    return (
        <CamperLayout title="Report an Issue" user={user}>
            {/* Header */}
            <div className="card p-4 bg-blue-50 border-blue-200 flex items-start gap-3">
                <Shield size={18} className="text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                    Your report is private and only visible to camp staff. Don't hesitate to submit — your safety matters.
                </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category <span className="text-danger">*</span></p>
                <div className="grid grid-cols-1 gap-2">
                    {CATEGORIES.map(c => (
                        <button key={c.value} onClick={() => setCategory(c.value)}
                            className={cn("flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                                category === c.value ? "border-primary bg-primary-soft" : "border-border bg-white hover:border-gray-300")}>
                            <span className="text-base">{c.label.split(" ")[0]}</span>
                            <div>
                                <p className="text-xs font-bold text-gray-900">{c.label.split(" ").slice(1).join(" ")}</p>
                                <p className="text-[10px] text-gray-500">{c.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Severity */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Severity <span className="text-danger">*</span></p>
                <div className="flex gap-2">
                    {SEVERITIES.map(s => (
                        <button key={s.value} onClick={() => setSeverity(s.value)}
                            className={cn("flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all", s.color,
                                severity === s.value ? "border-current ring-2 ring-current/30" : "border-transparent bg-white border border-border")}>
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description <span className="text-danger">*</span></p>
                <textarea value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Please describe what happened, where, and when…"
                    rows={4} className="input resize-none text-sm" />
            </div>

            {/* Optional phone */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contact Phone <span className="text-gray-400 font-normal normal-case">(optional)</span></p>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                    type="tel" placeholder="e.g. 0912-345-678" className="input text-sm" />
            </div>

            <button onClick={handleSubmit} disabled={submitting || !category || !severity || !content.trim()}
                className="btn btn-primary w-full gap-2 disabled:opacity-50">
                <Send size={16} /> {submitting ? "Submitting…" : "Submit Report"}
            </button>
        </CamperLayout>
    );
}
