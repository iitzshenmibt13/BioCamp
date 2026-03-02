import { AppHeader } from "./AppHeader";
import { BottomTabs } from "./BottomTabs";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
    title: string;
    user?: User | null;
    children: React.ReactNode;
    showBell?: boolean;
    noPad?: boolean;
    className?: string;
}

export function CamperLayout({ title, user, children, showBell, noPad, className }: Props) {
    return (
        <div className="min-h-screen bg-bg flex flex-col">
            <AppHeader title={title} user={user} showBell={showBell} />
            <main className={cn("flex-1 pb-24", !noPad && "px-4 py-4 space-y-4", className)}>
                {children}
            </main>
            <BottomTabs />
        </div>
    );
}
