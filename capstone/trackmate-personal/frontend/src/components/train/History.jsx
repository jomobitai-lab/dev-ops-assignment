import { useEffect, useState } from "react";
import { ChevronLeft, Calendar, ChevronDown } from "lucide-react";
import { api } from "../../api";

// Past sessions, grouped nicely (matches the WhatsApp-style log the user keeps).
export default function History({ onBack }) {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => { api.get("/workouts").then((w) => setRows(w.slice().reverse())).catch(() => {}); }, []);

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-full bg-secondary p-2 active:scale-95"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="text-xl font-extrabold tracking-tight">History</h1>
      </header>

      {rows.length === 0 && <div className="rounded-2xl bg-card px-4 py-6 text-center text-sm text-muted-foreground">No sessions logged yet.</div>}

      <div className="space-y-2">
        {rows.map((w) => {
          const byEx = groupByExercise(w.sets);
          const isOpen = open === w.id;
          return (
            <div key={w.id} className="overflow-hidden rounded-2xl bg-card">
              <button onClick={() => setOpen(isOpen ? null : w.id)} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
                <div>
                  <div className="text-sm font-semibold">{w.day_label}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />{w.date} · {byEx.length} exercises · {w.sets.length} sets
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="space-y-2 border-t border-border px-4 py-3">
                  {byEx.map((ex) => (
                    <div key={ex.name} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium">{ex.name}</span>
                      <span className="text-right tabular-nums text-muted-foreground">
                        {ex.topWeight > 0 ? `${ex.topWeight}kg ` : ""}{ex.reps.join("×")}
                        {ex.comments.length > 0 && <div className="text-[11px] italic text-muted-foreground/70">{ex.comments.join("; ")}</div>}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function groupByExercise(sets) {
  const map = new Map();
  sets.forEach((s) => {
    const name = s.exercise_name || `#${s.exercise_id}`;
    if (!map.has(name)) map.set(name, { name, reps: [], topWeight: 0, comments: [] });
    const g = map.get(name);
    g.reps.push(s.reps);
    g.topWeight = Math.max(g.topWeight, s.weight_kg);
    if (s.comment) g.comments.push(s.comment);
  });
  return [...map.values()];
}
