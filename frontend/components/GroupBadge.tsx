import { cn, getGroupStyle } from "@/lib/utils";

interface Props {
    name: string;
    color?: string;
    size?: "sm" | "md" | "lg";
    showBg?: boolean;
}

export function GroupBadge({ name, color, size = "md", showBg }: Props) {
    const style = color ? { color, bg: color + "20" } : getGroupStyle(name);
    const sizeClasses = {
        sm: "text-xs gap-1.5 px-2 py-0.5",
        md: "text-sm gap-2 px-2.5 py-1",
        lg: "text-base gap-2 px-3 py-1.5",
    };
    const dotSize = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3 h-3" };

    return (
        <span
            className={cn("inline-flex items-center font-semibold rounded-full", sizeClasses[size])}
            style={{ background: showBg ? style.bg : "transparent", color: style.color, border: `1.5px solid ${style.color}30` }}
        >
            <span className={cn("rounded-full shrink-0", dotSize[size])} style={{ background: style.color }} />
            {name}
        </span>
    );
}
