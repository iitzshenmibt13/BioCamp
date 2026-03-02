import { ClipboardList, Clock, CheckCircle2, FileCheck } from "lucide-react";
import { formatRelative, cn } from "@/lib/utils";
import type { Assignment, Submission } from "@/lib/types";
import Link from "next/link";

interface Props {
    assignment: Assignment;
    submission?: Submission;
    onClick?: () => void;
}

function getStatus(assignment: Assignment, submission?: Submission) {
    if (!submission) {
        const overdue = new Date(assignment.dueAt) < new Date();
        return overdue ? { label: "Overdue", color: "text-danger bg-red-50", icon: Clock } : { label: "Pending", color: "text-amber-600 bg-amber-50", icon: Clock };
    }
    if (submission.grade?.isPublished) return { label: "Graded", color: "text-success bg-green-50", icon: FileCheck };
    return { label: "Submitted", color: "text-primary bg-blue-50", icon: CheckCircle2 };
}

export function AssignmentCard({ assignment, submission, onClick }: Props) {
    const status = getStatus(assignment, submission);
    const StatusIcon = status.icon;

    return (
        <Link href={`/homework/${assignment.id}`}
            className="card p-4 flex items-start gap-3 hover:shadow-lifted transition-shadow cursor-pointer block">
            <div className="w-10 h-10 bg-primary-soft rounded-xl flex items-center justify-center shrink-0">
                <ClipboardList size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-bold text-gray-900 leading-snug">{assignment.title}</p>
                    <span className={cn("badge shrink-0 text-[10px]", status.color)}>
                        <StatusIcon size={10} /> {status.label}
                    </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    Due {formatRelative(assignment.dueAt)} · Max {assignment.maxScore} pts
                </p>
                {submission?.grade?.isPublished && (
                    <p className="text-[12px] font-bold text-success mt-1">
                        Score: {submission.grade.score}/{submission.grade.maxScore}
                    </p>
                )}
            </div>
        </Link>
    );
}
