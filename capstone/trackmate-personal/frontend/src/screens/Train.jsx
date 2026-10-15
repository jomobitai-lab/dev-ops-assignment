import { useEffect, useMemo, useState } from "react";
import { Plus, Trophy, ChevronRight, Check, X, Calendar, Trash2 } from "lucide-react";
import { api } from "../api";
import BodyMap from "../components/widgets/BodyMap.jsx";
import { Sheet, Field, inputCls } from "../components/ui/sheet.jsx";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Train() {
  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [recent, setRecent] = useState([]);
  const [muscles, setMuscles] = useState([]);          // selected groups from body map
  const [session, setSession] = useState([]);          // [{exercise_id, name, group, weight, reps, comment}]
  const [logFor, setLogFor] = useState(null);          // exercise open in logger sheet
  const [planOpen, setPlanOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);

  const loadAll = () => {
    api.get("/exercises").then(setExercises).catch(() => {});
    api.get("/plans").then(setPlans).catch(() => {});
    api.get("/workouts").then((w) => setRecent(w.slice().reverse())).catch(() => {});
  };
  useEffect(loadAll, []);

  const toggleMuscle = (g) =>
    setMuscles((m) => (m.includes(g) ? m.filter((x) => x !== g) : [...m, g]));

  const shown = useMemo(() => {
    if (!muscles.length) return exercises;
    return exercises.filter((e) => muscles.includes(e.muscle_group));
  }, [exercises, muscles]);

  function applyPlan(plan) {
    const groups = plan.muscle_groups ? plan.muscle_groups.split(",").map((s) => s.trim()).filter(Boolean) : [];
    setMuscles(groups);
  }

  function addSet(exercise, { weight, reps, comment }) {
    setSession((s) => [
      ...s,
      {
        exercise_id: exercise.id, name: exercise.name, group: exercise.muscle_group,
        weight: parseFloat(weight || 0), reps: parseInt(reps || 0), comment: comment || "",
      },
    ]);
  }
  const removeSet = (i) => setSession((s) => s.filter((_, idx) => idx !== i));

  const defaultLabel = () => {
    const gs = [...new Set(session.map((s) => s.group))];
    return gs.length ? gs.join(" + ") : "Workout";
  };

  async function finishSession(label) {
    const byEx = {};
    session.forEach((s) => (byEx[s.exercise_id] = (byEx[s.exercise_id] || 0) + 1));
    const counter = {};
    const sets = session.map((s) => {
      counter[s.exercise_id] = (counter[s.exercise_id] || 0) + 1;
      return {
        exercise_id: s.exercise_id, set_number: counter[s.exercise_id],
        weight_kg: s.weight, reps: s.reps, comment: s.comment,
      };
    });
    await api.post("/workouts", { date: todayISO(), day_label: label || defaultLabel(), notes: "", sets });
    setSession([]); setMuscles([]); setFinishOpen(false);
    loadAll();
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Train</h1>
        {session.length > 0 && (
          <button
            onClick={() => setFinishOpen(true)}
            className="rounded-full bg-lime px-4 py-2 text-sm font-bold text-black active:scale-95"
          >
            Finish · {session.length}
          </button>
        )}
      </header>

      {/* workout plans */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Workout plans</h2>
          <button onClick={() => setPlanOpen(true)} className="flex items-center gap-1 text-xs text-lime">
            <Plus className="h-3.5 w-3.5" /> New plan
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {plans.length === 0 && (
            <div className="rounded-2xl bg-card px-4 py-3 text-xs text-muted-foreground">
              No plans yet. Create one to start faster.
            </div>
          )}
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPlan(p)}
              className="min-w-[150px] shrink-0 rounded-2xl bg-card p-4 text-left ring-1 ring-border active:ring-lime"
            >
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {p.items.length} exercise{p.items.length === 1 ? "" : "s"}
              </div>
              <div className="mt-2 text-[11px] text-lime">{p.muscle_groups || "—"}</div>
            </button>
          ))}
        </div>
      </section>

      {/* body map */}
      <section className="rounded-3xl bg-card p-5">
        <BodyMap selected={muscles} onToggle={toggleMuscle} />
        {muscles.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {muscles.map((m) => (
              <span key={m} className="rounded-full bg-lime/15 px-3 py-1 text-xs font-medium text-lime">
                {m}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* exercise list */}
      <section>
        <h2 className="mb-2 text-sm font-semibold">
          {muscles.length ? "Exercises" : "All exercises"}
          <span className="ml-1 text-xs font-normal text-muted-foreground">({shown.length})</span>
        </h2>
        <div className="space-y-2">
          {shown.map((e) => {
            const done = session.filter((s) => s.exercise_id === e.id).length;
            return (
              <button
                key={e.id}
                onClick={() => setLogFor(e)}
                className="flex w-full items-center justify-between rounded-2xl bg-card px-4 py-3.5 text-left active:bg-secondary"
              >
                <div>
                  <div className="text-sm font-semibold">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.muscle_group}{e.equipment ? ` · ${e.equipment}` : ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  {done > 0 && (
                    <span className="rounded-full bg-lime/15 px-2 py-0.5 text-xs font-bold text-lime">{done} set{done === 1 ? "" : "s"}</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* recent sessions */}
      {recent.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold">Recent sessions</h2>
          <div className="space-y-2">
            {recent.slice(0, 5).map((w) => (
              <div key={w.id} className="rounded-2xl bg-card px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{w.day_label}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />{w.date}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{w.sets.length} sets</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {logFor && (
        <LogSheet
          exercise={logFor}
          existing={session.filter((s) => s.exercise_id === logFor.id)}
          onAdd={(vals) => addSet(logFor, vals)}
          onRemove={(i) => {
            // index is within this exercise's sets; map to global
            const globalIdx = session.findIndex((s, gi) =>
              s.exercise_id === logFor.id &&
              session.filter((x, xi) => x.exercise_id === logFor.id && xi <= gi).length - 1 === i);
            if (globalIdx >= 0) removeSet(globalIdx);
          }}
          onClose={() => setLogFor(null)}
        />
      )}

      <PlanSheet open={planOpen} onClose={() => setPlanOpen(false)} exercises={exercises}
        onSaved={() => { setPlanOpen(false); loadAll(); }} />

      <FinishSheet open={finishOpen} onClose={() => setFinishOpen(false)}
        session={session} defaultLabel={defaultLabel()} onRemove={removeSet} onFinish={finishSession} />
    </div>
  );
}

// ---------- set logger (shows last PR for the exercise) ----------
function LogSheet({ exercise, existing, onAdd, onRemove, onClose }) {
  const [last, setLast] = useState(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    api.get(`/exercises/${exercise.id}/last`).then(setLast).catch(() => setLast(null));
  }, [exercise.id]);

  function submit(e) {
    e.preventDefault();
    if (!weight && !reps) return;
    onAdd({ weight, reps, comment });
    setWeight(""); setReps(""); setComment("");
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={exercise.name}>
      {/* last PR card */}
      <div className="mb-4 rounded-2xl bg-secondary p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-lime">
          <Trophy className="h-4 w-4" /> Last time
        </div>
        {last && last.last_date ? (
          <div className="mt-2 space-y-1">
            <div className="text-sm">
              <span className="font-bold tabular-nums">{last.last_best_weight} kg</span>
              <span className="text-muted-foreground"> × {last.last_best_reps} reps</span>
              <span className="ml-2 text-xs text-muted-foreground">on {last.last_date}</span>
            </div>
            {last.pr_weight != null && (
              <div className="text-xs text-muted-foreground">
                All-time best: <span className="font-semibold text-foreground">{last.pr_weight} kg</span>
              </div>
            )}
            {last.last_comment && (
              <div className="mt-1 rounded-lg bg-background/60 px-2.5 py-1.5 text-xs italic text-muted-foreground">
                “{last.last_comment}”
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 text-xs text-muted-foreground">No history yet — this is your first time logging it.</div>
        )}
      </div>

      {/* sets added this session */}
      {existing.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {existing.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2 text-sm">
              <span className="text-muted-foreground">Set {i + 1}</span>
              <span className="font-semibold tabular-nums">{s.weight} kg × {s.reps}</span>
              <button onClick={() => onRemove(i)} className="text-muted-foreground active:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Weight (kg)">
            <input type="number" step="0.5" inputMode="decimal" value={weight}
              onChange={(e) => setWeight(e.target.value)} className={inputCls} placeholder="0" />
          </Field>
          <Field label="Reps">
            <input type="number" inputMode="numeric" value={reps}
              onChange={(e) => setReps(e.target.value)} className={inputCls} placeholder="0" />
          </Field>
        </div>
        <Field label="Comment (optional)">
          <input value={comment} onChange={(e) => setComment(e.target.value)}
            className={inputCls} placeholder="felt easy, go heavier next time" />
        </Field>
        <button className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-lime py-3 font-bold text-black active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Add set
        </button>
        <button type="button" onClick={onClose}
          className="mt-2 w-full rounded-xl bg-secondary py-3 text-sm font-medium text-muted-foreground">
          Done
        </button>
      </form>
    </Sheet>
  );
}

// ---------- workout plan creator ----------
function PlanSheet({ open, onClose, exercises, onSaved }) {
  const [name, setName] = useState("");
  const [picked, setPicked] = useState([]); // exercise ids
  const [busy, setBusy] = useState(false);

  const groups = [...new Set(exercises.map((e) => e.muscle_group))];

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  async function save() {
    if (!name || !picked.length) return;
    setBusy(true);
    const chosen = exercises.filter((e) => picked.includes(e.id));
    const mg = [...new Set(chosen.map((e) => e.muscle_group))].join(", ");
    const items = picked.map((id, i) => ({ exercise_id: id, position: i }));
    try {
      await api.post("/plans", { name, muscle_groups: mg, items });
      setName(""); setPicked([]); onSaved();
    } finally { setBusy(false); }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} title="New workout plan">
      <Field label="Plan name">
        <input value={name} onChange={(e) => setName(e.target.value)}
          className={inputCls} placeholder="Tuesday — Chest + Triceps" />
      </Field>
      <div className="mb-1 text-xs font-medium text-muted-foreground">Pick exercises</div>
      <div className="max-h-[42vh] space-y-3 overflow-y-auto no-scrollbar">
        {groups.map((g) => (
          <div key={g}>
            <div className="mb-1 text-[11px] uppercase tracking-wider text-lime">{g}</div>
            <div className="space-y-1.5">
              {exercises.filter((e) => e.muscle_group === g).map((e) => {
                const on = picked.includes(e.id);
                return (
                  <button key={e.id} onClick={() => toggle(e.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ring-1 ${on ? "bg-lime/15 ring-lime" : "bg-secondary ring-border"}`}>
                    <span>{e.name}</span>
                    {on ? <Check className="h-4 w-4 text-lime" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button disabled={busy || !name || !picked.length} onClick={save}
        className="mt-4 w-full rounded-xl bg-lime py-3 font-bold text-black active:scale-[0.98] disabled:opacity-50">
        {busy ? "Saving…" : `Save plan (${picked.length})`}
      </button>
    </Sheet>
  );
}

// ---------- finish / review session ----------
function FinishSheet({ open, onClose, session, defaultLabel, onRemove, onFinish }) {
  const [label, setLabel] = useState("");
  useEffect(() => { if (open) setLabel(defaultLabel); }, [open, defaultLabel]);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} title="Finish session">
      <Field label="What day is this?">
        <input value={label} onChange={(e) => setLabel(e.target.value)}
          className={inputCls} placeholder="Chest + Triceps" />
      </Field>
      <div className="mb-4 max-h-[40vh] space-y-1.5 overflow-y-auto no-scrollbar">
        {session.map((s, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2 text-sm">
            <div>
              <span className="font-medium">{s.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{s.weight} kg × {s.reps}</span>
            </div>
            <button onClick={() => onRemove(i)} className="text-muted-foreground active:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => onFinish(label)}
        className="w-full rounded-xl bg-lime py-3 font-bold text-black active:scale-[0.98]">
        Save session
      </button>
    </Sheet>
  );
}
