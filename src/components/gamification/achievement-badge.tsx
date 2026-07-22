import {
  Calendar,
  Flame,
  Lock,
  Medal,
  Play,
  TrendingUp,
  Trophy,
  Weight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  play: Play,
  flame: Flame,
  medal: Medal,
  weight: Weight,
  "trending-up": TrendingUp,
  calendar: Calendar,
};

export type AchievementView = {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  unlocked: boolean;
  progress: { current: number; target: number } | null;
};

export function AchievementBadge({ a }: { a: AchievementView }) {
  const Icon = (a.icon && ICONS[a.icon]) || Trophy;
  const pct = a.progress
    ? Math.min(100, Math.round((a.progress.current / a.progress.target) * 100))
    : 0;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        a.unlocked ? "border-primary/30 bg-primary/5" : "bg-card",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            a.unlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {a.unlocked ? <Icon className="size-5" /> : <Lock className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-semibold", !a.unlocked && "text-muted-foreground")}>
            {a.name}
          </p>
          {a.description && (
            <p className="text-muted-foreground truncate text-xs">{a.description}</p>
          )}
        </div>
      </div>

      {!a.unlocked && a.progress && (
        <div className="mt-3">
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div className="bg-primary/60 h-full rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-muted-foreground mt-1 text-right text-[10px] tabular-nums">
            {Math.round(a.progress.current)}/{a.progress.target}
          </p>
        </div>
      )}
    </div>
  );
}
