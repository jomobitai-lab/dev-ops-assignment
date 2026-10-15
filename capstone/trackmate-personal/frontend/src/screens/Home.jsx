import { useEffect, useState } from "react";
import { Activity, Dumbbell, Moon, Wallet } from "lucide-react";
import { api } from "../api";
import StreakBadge from "../components/widgets/StreakBadge.jsx";
import Heatmap from "../components/widgets/Heatmap.jsx";
import MuscleRadar from "../components/widgets/MuscleRadar.jsx";
import GlowArea from "../components/widgets/GlowArea.jsx";

const NAME = "Pulasari";

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [balance, setBalance] = useState([]);
  const [weights, setWeights] = useState([]);

  useEffect(() => {
    api.get("/stats/summary").then(setSummary).catch(() => {});
    api.get("/stats/activity").then(setActivity).catch(() => {});
    api.get("/stats/muscle-balance").then(setBalance).catch(() => {});
    api.get("/body-weight").then(setWeights).catch(() => {});
  }, []);

  const weightData = weights
    .slice(-14)
    .map((w) => ({ label: w.date.slice(5), weight: w.weight_kg }));

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-muted-foreground">{greet},</p>
        <h1 className="text-2xl font-extrabold tracking-tight">{NAME} 👋</h1>
      </header>

      {/* streak + quick numbers */}
      <div className="grid grid-cols-2 gap-4">
        <StreakBadge
          weeks={summary?.week_streak ?? 0}
          thisWeek={summary?.this_week_workouts ?? 0}
          goal={summary?.weekly_goal ?? 3}
        />
        <div className="grid grid-rows-2 gap-4">
          <Stat icon={Dumbbell} label="Workouts" value={summary?.total_workouts ?? 0} />
          <Stat icon={Moon} label="Avg sleep" value={summary ? `${summary.avg_sleep_hours}h` : "—"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stat icon={Activity} label="Body weight"
          value={summary?.current_weight ? `${summary.current_weight} kg` : "—"} />
        <Stat icon={Wallet} label="Earned"
          value={summary ? `₹${Number(summary.total_earnings).toLocaleString("en-IN")}` : "—"} />
      </div>

      {/* activity heatmap */}
      <Card title="Activity">
        <Heatmap data={activity} />
      </Card>

      {/* body weight trend */}
      {weightData.length > 1 && (
        <Card title="Body weight">
          <GlowArea data={weightData} dataKey="weight" height={180} domain={["dataMin - 1", "dataMax + 1"]} />
        </Card>
      )}

      {/* muscle balance */}
      <Card title="Muscle balance" subtitle="sets logged per group">
        <MuscleRadar data={balance} />
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col justify-between rounded-3xl bg-card p-4">
      <Icon className="h-5 w-5 text-lime" strokeWidth={2.2} />
      <div className="mt-3">
        <div className="text-xl font-bold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl bg-card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}
