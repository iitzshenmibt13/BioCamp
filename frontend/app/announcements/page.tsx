"use client";
import { CamperLayout } from "@/components/CamperLayout";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { EmptyState } from "@/components/EmptyState";
import { MOCK_ANNOUNCEMENTS, MOCK_USER_CAMPER } from "@/lib/mock";
import { Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
    const user = MOCK_USER_CAMPER;
    const pinned = MOCK_ANNOUNCEMENTS.filter(a => a.isPinned);
    const rest = MOCK_ANNOUNCEMENTS.filter(a => !a.isPinned);

    return (
        <CamperLayout title="Announcements" user={user}>
            {MOCK_ANNOUNCEMENTS.length === 0 ? (
                <EmptyState icon={Megaphone} title="No announcements yet" description="Check back soon for camp updates." />
            ) : (
                <>
                    {pinned.length > 0 && (
                        <div className="space-y-3">
                            {pinned.map(a => <AnnouncementCard key={a.id} ann={a} preview />)}
                        </div>
                    )}
                    {rest.length > 0 && (
                        <div className="space-y-3">
                            {pinned.length > 0 && <p className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-1">Earlier</p>}
                            {rest.map(a => <AnnouncementCard key={a.id} ann={a} preview />)}
                        </div>
                    )}
                </>
            )}
        </CamperLayout>
    );
}
