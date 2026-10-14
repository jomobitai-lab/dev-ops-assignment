import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { api } from "../api";
import Heatmap from "./Heatmap.jsx";

const axis = { fill: "#8b95a3", fontSize: 11 };

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [weights, setWeights] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [prs, setPrs] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    api.get("/stats/summary").then(setSummary);
    api.get("/body-weight").then(setWeights);
    api.get("/nutrition").then(setNutrition);
    api.get("/earnings").then(setEarnings);
    api.get("/stats/prs").then(setPrs);
    api.get("/stats/activity").then(setActivity);
  }, []);

  if (!summary) return <div className="muted">Loading…</div>;

  // earnings grouped by month
  const byMonth = {};
  earnings.forEach((e) => {
    const m = e.date.slice(0, 7);
    byMonth[m] = (byMonth[m] || 0) + e.amount;
  });
  const earnData = Object.entries(byMonth).sort().map(([month, amount]) => ({ month, amount }));

  const Stat = ({ title, value, unit, sub }) => (
    <div className="card">
      <h3>{title}</h3>
      <div className="stat">{value}<span className="unit"> {unit}</span>{sub && <small>{sub}</small>}</div>
    </div>
  );

  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Stat title="Current weight" value={summary.current_weight ?? "—"} unit="kg"
          sub={summary.target_weight ? `Target: ${summary.target_weight} kg` : "No target set"} />
        <Stat title="Calories today" value={summary.today_calories} unit="kcal"
          sub={summary.target_calories ? `Target: ${summary.target_calories}` : "No target set"} />
        <Stat title="Gym streak" value={summary.gym_streak} unit="days"
          sub={`${summary.total_workouts} total workouts`} />
        <Stat title="Total earned" value={`₹${summary.total_earnings.toLocaleString("en-IN")}`} unit=""
          sub={summary.savings_goal ? `Goal: ₹${summary.savings_goal.toLocaleString("en-IN")}` : "Avg sleep " + summary.avg_sleep_hours + "h"} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h3>Body weight trend (kg)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weights.map((w) => ({ date: w.date.slice(5), weight: w.weight_kg }))}>
              <CartesianGrid stroke="#2a313b" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={axis} /><YAxis tick={axis} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#171b21", border: "1px solid #2a313b" }} />
              <Line type="monotone" dataKey="weight" stroke="#4ade80" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Calories per day (kcal)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={nutrition.map((n) => ({ date: n.date.slice(5), calories: n.calories }))}>
              <CartesianGrid stroke="#2a313b" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={axis} /><YAxis tick={axis} />
              <Tooltip contentStyle={{ background: "#171b21", border: "1px solid #2a313b" }} />
              <Line type="monotone" dataKey="calories" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h3>Earnings by month (₹)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={earnData}>
              <CartesianGrid stroke="#2a313b" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={axis} /><YAxis tick={axis} />
              <Tooltip contentStyle={{ background: "#171b21", border: "1px solid #2a313b" }} />
              <Bar dataKey="amount" fill="#fbbf24" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Personal Records (heaviest set)</h3>
          <table>
            <thead><tr><th>Exercise</th><th>Best</th></tr></thead>
            <tbody>
              {prs.slice(0, 7).map((p) => (
                <tr key={p.exercise}><td>{p.exercise}</td><td><span className="pill">{p.max_weight_kg} kg</span></td></tr>
              ))}
              {prs.length === 0 && <tr><td colSpan="2" className="muted">Log a workout to see PRs.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Workout activity</h3>
        <Heatmap activity={activity} />
      </div>
    </>
  );
}
