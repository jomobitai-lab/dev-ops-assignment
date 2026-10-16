import { Activity, Dumbbell, Moon, Wallet } from "lucide-react";
import StreakBadge from "../components/widgets/StreakBadge.jsx";
import Heatmap from "../components/widgets/Heatmap.jsx";
import MuscleRadar from "../components/widgets/MuscleRadar.jsx";
import GlowArea from "../components/widgets/GlowArea.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.tsx";
import { useFetch, ErrorState, Skeleton } from "../components/ui/feedback.jsx";

export default function Home() {
  const summaryQ = useFetch("/stats/summary");
  const activityQ = useFetch("/stats/activity");
  const balanceQ = useFetch("/stats/muscle-balance");
  const weightsQ = useFetch("/body-weight");
  const profileQ = useFetch("/profile");

  const summary = summaryQ.data;
  const weightData = (weightsQ.data || []).slice(-14).map((w) => ({ label: w.date.slice(5), weight: w.weight_kg }));

  const firstName = (profileQ.data?.name || "").trim().split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-muted-foreground">{greet},</p>
        <h1 className="text-2xl font-extrabold tracking-tight">{firstName} 👋</h1>
      </header>

      {summaryQ.loading ? (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[188px]" />
          <div className="grid grid-rows-2 gap-4"><Skeleton className="h-[86px]" /><Skeleton className="h-[86px]" /></div>
        </div>
      ) : summaryQ.error ? (
        <ErrorState error={summaryQ.error} onRetry={summaryQ.reload} label="Couldn't load your stats" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <StreakBadge weeks={summary.week_streak ?? 0} thisWeek={summary.this_week_workouts ?? 0} goal={summary.weekly_goal ?? 3} />
            <div className="grid grid-rows-2 gap-4">
              <Stat icon={Dumbbell} label="Workouts" num={summary.total_workouts ?? 0} />
              <Stat icon={Moon} label="Avg sleep" num={summary.avg_sleep_hours ?? 0} suffix="h" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat icon={Activity} label="Body weight" num={summary.current_weight ?? null} suffix=" kg" />
            <Stat icon={Wallet} label="Earned" text={`₹${Number(summary.total_earnings ?? 0).toLocaleString("en-IN")}`} />
          </div>
        </>
      )}

      <Card title="Activity" q={activityQ} label="Couldn't load activity">
        <Heatmap data={activityQ.data || []} />
      </Card>

      {!weightsQ.loading && weightData.length > 1 && (
        <Card title="Body weight">
          <GlowArea data={weightData} dataKey="weight" height={180} domain={["dataMin - 1", "dataMax + 1"]} />
        </Card>
      )}

      <Card title="Muscle balance" subtitle="sets logged per group" q={balanceQ} label="Couldn't load muscle balance">
        <MuscleRadar data={balanceQ.data || []} />
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, num, suffix = "", text }) {
  return (
    <div className="flex flex-col justify-between rounded-3xl bg-card p-4">
      <Icon className="h-5 w-5 text-lime" strokeWidth={2.2} />
      <div className="mt-3">
        <div className="flex items-baseline text-xl font-bold tracking-tight">
          {text != null ? text : num == null ? "—" : (<><SlidingNumber value={num} />{suffix}</>)}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children, q, label }) {
  return (
    <section className="rounded-3xl bg-card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
      {q?.loading ? <Skeleton className="h-28 !bg-secondary" />
        : q?.error ? <ErrorState error={q.error} onRetry={q.reload} label={label} />
        : children}
    </section>
  );
}
