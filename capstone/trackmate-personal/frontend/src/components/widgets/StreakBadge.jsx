import { Flame } from "lucide-react";

// Weekly streak badge (you train a few days/week, so it counts weeks, not days).
export default function StreakBadge({ weeks = 0, thisWeek = 0, goal = 3 }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl bg-card p-5">
      <Flame className="h-8 w-8 text-lime" strokeWidth={2.2} />
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight">{weeks}</span>
          <span className="text-xl font-semibold text-muted-foreground">
            {weeks === 1 ? "week" : "weeks"}
          </span>
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground">streak</div>
        <div className="mt-2 text-xs text-muted-foreground">
          this week <span className="text-lime font-semibold">{thisWeek}</span> / {goal}
        </div>
      </div>
    </div>
  );
}
