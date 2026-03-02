"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pin, Megaphone } from "lucide-react";
import { CamperLayout } from "@/components/CamperLayout";
import { EmptyState } from "@/components/EmptyState";
import { MOCK_ANNOUNCEMENTS, MOCK_USER_CAMPER } from "@/lib/mock";
import { formatRelative } from "@/lib/utils";

export default function AnnouncementDetailPage() {
    const { id } = useParams<{ id: string }>();
    const user = MOCK_USER_CAMPER;
    const ann = MOCK_ANNOUNCEMENTS.find(a => a.id === id);

    if (!ann) return (
        <CamperLayout title="Not Found" user={user}>
            <EmptyState icon={Megaphone} title="Announcement not found" action={<Link href="/announcements" className="btn btn-primary">Back</Link>} />
        </CamperLayout>
    );

    return (
        <CamperLayout title="Announcement" user={user}>
            <Link href="/announcements" className="inline-flex items-center gap-1 text-sm text-primary font-semibold -ml-1">
                <ChevronLeft size={16} /> Announcements
            </Link>
            <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                    {ann.isPinned && <span className="badge bg-primary text-white text-[9px]">PINNED</span>}
                    <span className="text-[11px] text-gray-400">{ann.createdByName} · {formatRelative(ann.createdAt)}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-snug mb-3">{ann.title}</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
            </div>
        </CamperLayout>
    );
}
