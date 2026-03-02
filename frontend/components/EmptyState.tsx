import { type LucideIcon } from "lucide-react";
import { InboxIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon = InboxIcon, title, description, action, className }: Props) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Icon size={28} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-semibold text-gray-700 mb-1">{title}</p>
            {description && <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
