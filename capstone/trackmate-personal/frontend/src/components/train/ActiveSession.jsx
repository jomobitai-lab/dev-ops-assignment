import { useMemo, useState } from "react";
import { Check, ChevronRight, Plus, Trash2, Search, Flag } from "lucide-react";
import { api } from "../../api";
import BodyMap from "../widgets/BodyMap.jsx";
import { Sheet, inputCls } from "../ui/sheet.jsx";
import { useToast } from "../ui/toast.jsx";
import ExerciseSheet from "./ExerciseSheet.jsx";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ActiveSession({ session, setSession, defaultRest = 90, onEnd }) {
  const toast = useToast();
  const [openId, setOpenId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [all, setAll] = useState([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const exercises = session.exercises;
  const openEx = exercises.find((e) => e.id === openId);
  const doneCount = exercises.filter((e) => e.done).length;

  const highlight = useMemo(
    () => [...new Set(exercises.flatMap((e) => (e.body_parts || "").split(",").filter(Boolean)))],
    [exercises]
  );

  function updateExercise(updated) {
    setSession((s) => ({ ...s, exercises: s.exercises.map((e) => (e.id === updated.id ? updated : e)) }));
  }
  function removeExercise(id) {
    setSession((s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== id) }));
  }
  function openAdd() {
    if (!all.length) api.get("/exercises").then(setAll).catch((err) => toast.error(err));
    setAddOpen(true);
  }
  function addExercise(ex) {
    if (exercises.some((e) => e.id === ex.id)) return;
    setSession((s) => ({ ...s, exercises: [...s.exercises, { ...ex, sets: [], done: false }] }));
  }

  async function endSession() {
    setSaving(true);
    const sets = [];
    exercises.forEach((ex) => {
      (ex.sets || []).forEach((st, i) =>
        sets.push({ exercise_id: ex.id, set_number: i + 1, weight_kg: st.weight, reps: st.reps, comment: st.comment || "" }));
    });
    try {
      await api.post("/workouts", { date: todayISO(), day_label: session.dayLabel || "Workout", notes: "", sets });
      toast.success("Session saved to history");
      onEnd();
    } catch (err) { toast.error(err); } finally { setSaving(false); }
  }

  const shown = all.filter((e) => {
    if (exercises.some((x) => x.id === e.id)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return e.name.toLowerCase().includes(q) || (e.target_part || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lime">
            <span className="h-2 w-2 animate-pulse rounded-full bg-lime" /> ACTIVE SESSION
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{session.dayLabel || "Workout"}</h1>
          <p className="text-sm text-muted-foreground">{doneCount}/{exercises.length} done · {todayISO()}</p>
        </div>
        <button onClick={endSession} disabled={saving}
          className="flex items-center gap-1.5 rounded-full bg-lime px-4 py-2 text-sm font-bold text-black active:scale-95 disabled:opacity-60">
          <Flag className="h-4 w-4" /> {saving ? "Saving…" : "End"}
        </button>
      </header>

      {highlight.length > 0 && (
        <section className="rounded-3xl bg-card p-4"><BodyMap muscles={highlight} compact /></section>
      )}

      <div className="space-y-2">
        {exercises.map((e) => {
          const setCount = (e.sets || []).length;
          return (
            <div key={e.id} className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 ring-1 ${e.done ? "bg-lime/5 ring-lime/40" : "bg-card ring-transparent"}`}>
              <button onClick={() => setOpenId(e.id)} className="flex flex-1 items-center justify-between text-left">
                <div>
                  <div className={`text-sm font-semibold ${e.done ? "text-lime" : ""}`}>{e.name}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-lime/80">{e.target_part}</span>
                    {setCount > 0 ? ` · ${setCount} set${setCount === 1 ? "" : "s"}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {e.done
                    ? <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-black"><Check className="h-4 w-4" /></span>
                    : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              <button onClick={() => removeExercise(e.id)} className="text-muted-foreground active:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <button onClick={openAdd}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground active:border-lime active:text-lime">
        <Plus className="h-4 w-4" /> Add exercise
      </button>

      {openEx && (
        <ExerciseSheet exercise={openEx} defaultRest={defaultRest}
          onUpdate={updateExercise} onClose={() => setOpenId(null)} />
      )}

      {addOpen && (
        <Sheet open onOpenChange={(o) => !o && setAddOpen(false)} title="Add exercise">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputCls} pl-9`} placeholder="Search…" autoFocus />
          </div>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto no-scrollbar">
            {shown.map((e) => (
              <button key={e.id} onClick={() => { addExercise(e); setAddOpen(false); setQuery(""); }}
                className="flex w-full items-center justify-between rounded-2xl bg-secondary px-4 py-3 text-left active:bg-card">
                <div>
                  <div className="text-sm font-semibold">{e.name}</div>
                  <div className="text-xs text-muted-foreground"><span className="text-lime/80">{e.target_part}</span> · {e.muscle_group}</div>
                </div>
                <Plus className="h-4 w-4 text-lime" />
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}
