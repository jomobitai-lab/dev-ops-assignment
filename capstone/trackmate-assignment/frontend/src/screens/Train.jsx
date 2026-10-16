import { useEffect, useState } from "react";
import { Play, Plus, History as HistoryIcon, Dumbbell, Pencil, Trash2 } from "lucide-react";
import { api } from "../api";
import SessionBuilder from "../components/train/SessionBuilder.jsx";
import ActiveSession from "../components/train/ActiveSession.jsx";
import History from "../components/train/History.jsx";
import { useToast } from "../components/ui/toast.jsx";
import { ErrorState, Skeleton } from "../components/ui/feedback.jsx";

export default function Train() {
  const toast = useToast();
  const [mode, setMode] = useState("home");   // home | build | active | template | history
  const [session, setSession] = useState({ dayLabel: "", exercises: [] });
  const [templates, setTemplates] = useState([]);
  const [tplLoading, setTplLoading] = useState(true);
  const [tplError, setTplError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [rest, setRest] = useState(90);

  const loadTemplates = () => {
    setTplLoading(true); setTplError(null);
    return api.get("/plans").then(setTemplates).catch(setTplError).finally(() => setTplLoading(false));
  };
  useEffect(() => {
    loadTemplates();
    api.get("/profile").then((p) => setRest(p.default_rest_seconds || 90)).catch(() => {});
  }, []);

  const exFromTemplate = (t) =>
    t.items.map((it) => ({
      id: it.exercise_id, name: it.exercise_name, muscle_group: it.muscle_group,
      target_part: it.target_part, body_parts: it.body_parts, sets: [], done: false,
    }));

  function startFromTemplate(t) {
    setSession({ dayLabel: t.name, exercises: exFromTemplate(t) });
    setMode("active");
  }
  function startFresh(name, exercises) {
    setSession({ dayLabel: name, exercises: exercises.map((e) => ({ ...e, sets: [], done: false })) });
    setMode("active");
  }
  async function saveTemplate(name, exercises) {
    const groups = [...new Set(exercises.map((e) => e.muscle_group))].join(", ");
    const items = exercises.map((e, i) => ({ exercise_id: e.id, position: i }));
    try {
      if (editing) await api.put(`/plans/${editing.id}`, { name, muscle_groups: groups, items });
      else await api.post("/plans", { name, muscle_groups: groups, items });
      toast.success(editing ? "Plan updated" : "Workout plan saved");
      setEditing(null); await loadTemplates(); setMode("home");
    } catch (err) { toast.error(err); throw err; }   // rethrow so the builder keeps the sheet open
  }
  async function deleteTemplate(id) {
    try { await api.del(`/plans/${id}`); toast.success("Plan deleted"); loadTemplates(); }
    catch (err) { toast.error(err); }
  }

  if (mode === "build")
    return (
      <SessionBuilder
        title="New session" nameLabel="Name this day" namePlaceholder="Push day / Pull day…"
        submitLabel="Start session" onSubmit={startFresh} onCancel={() => setMode("home")}
      />
    );

  if (mode === "template")
    return (
      <SessionBuilder
        title={editing ? "Edit workout plan" : "Create workout plan"} nameLabel="Plan name"
        namePlaceholder="Pull day — Back + Biceps" submitLabel={editing ? "Save plan" : "Create plan"}
        initialName={editing?.name || ""} initialExerciseIds={editing ? editing.items.map((i) => i.exercise_id) : []}
        onSubmit={saveTemplate} onCancel={() => { setEditing(null); setMode("home"); }}
      />
    );

  if (mode === "active")
    return <ActiveSession session={session} setSession={setSession} defaultRest={rest} onEnd={() => { setMode("home"); loadTemplates(); }} />;

  if (mode === "history") return <History onBack={() => setMode("home")} />;

  // ---------- landing ----------
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Train</h1>
        <button onClick={() => setMode("history")} className="flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-2 text-sm text-muted-foreground active:text-foreground">
          <HistoryIcon className="h-4 w-4" /> History
        </button>
      </header>

      <button onClick={() => setMode("build")}
        className="flex w-full items-center justify-between rounded-3xl bg-lime p-5 text-black active:scale-[0.99]">
        <div className="text-left">
          <div className="text-lg font-extrabold">Start new session</div>
          <div className="text-sm font-medium opacity-70">Pick muscles & exercises, then train</div>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/10"><Play className="h-6 w-6" /></span>
      </button>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Workout plans</h2>
          <button onClick={() => { setEditing(null); setMode("template"); }} className="flex items-center gap-1 text-xs text-lime">
            <Plus className="h-3.5 w-3.5" /> New plan
          </button>
        </div>

        <div className="space-y-2">
          {tplLoading && [0, 1].map((i) => <Skeleton key={i} className="h-[74px]" />)}
          {!tplLoading && tplError && <ErrorState error={tplError} onRetry={loadTemplates} label="Couldn't load workout plans" />}
          {!tplLoading && !tplError && templates.length === 0 && (
            <div className="rounded-2xl bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              No workout plans yet. Create one to start a session in one tap.
            </div>
          )}
          {!tplLoading && !tplError && templates.map((t) => (
            <div key={t.id} className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3.5">
              <button onClick={() => startFromTemplate(t)} className="flex flex-1 items-center justify-between text-left">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Dumbbell className="h-4 w-4 text-lime" /> {t.name}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {t.items.length} exercises · <span className="text-lime/80">{t.muscle_groups}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-lime/15 px-2.5 py-1 text-xs font-bold text-lime">
                  <Play className="h-3 w-3" /> Start
                </span>
              </button>
              <button onClick={() => { setEditing(t); setMode("template"); }} className="text-muted-foreground active:text-foreground"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => deleteTemplate(t.id)} className="text-muted-foreground active:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
