import { useEffect, useMemo, useState } from "react";
import { Search, Check, Plus, ChevronLeft, X, PlusCircle } from "lucide-react";
import { api } from "../../api";
import BodyMap, { musclesForGroups } from "../widgets/BodyMap.jsx";
import { Sheet, Field, inputCls } from "../ui/sheet.jsx";
import { useToast } from "../ui/toast.jsx";

const GROUPS = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Forearms", "Legs", "Core"];

// Reused for "build today's session" and "create a template".
// onSubmit(name, exercises[])  — exercises are full exercise objects.
export default function SessionBuilder({
  title, nameLabel, namePlaceholder, submitLabel,
  initialName = "", initialExerciseIds = [], onSubmit, onCancel,
}) {
  const toast = useToast();
  const [all, setAll] = useState([]);
  const [groups, setGroups] = useState([]);
  const [picked, setPicked] = useState(initialExerciseIds);   // exercise ids, ordered
  const [query, setQuery] = useState("");
  const [name, setName] = useState(initialName);
  const [customOpen, setCustomOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadExercises = () => api.get("/exercises").then(setAll).catch(() => {});
  useEffect(() => { loadExercises(); }, []);

  async function createCustom(form) {
    try {
      const created = await api.post("/exercises", form);
      await loadExercises();
      setPicked((s) => (s.includes(created.id) ? s : [...s, created.id]));
      if (form.muscle_group && !groups.includes(form.muscle_group)) setGroups((g) => [...g, form.muscle_group]);
      setCustomOpen(false);
      toast.success(`Added "${created.name}"`);
    } catch (err) { toast.error(err); throw err; }   // rethrow so the sheet keeps its busy state off
  }

  // when starting from a template, default the group chips to the picked exercises' groups
  useEffect(() => {
    if (all.length && initialExerciseIds.length && !groups.length) {
      const g = new Set();
      all.filter((e) => initialExerciseIds.includes(e.id)).forEach((e) => g.add(e.muscle_group));
      setGroups([...g]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all]);

  const byId = useMemo(() => Object.fromEntries(all.map((e) => [e.id, e])), [all]);
  const pickedExercises = picked.map((id) => byId[id]).filter(Boolean);

  const toggleGroup = (g) => setGroups((s) => (s.includes(g) ? s.filter((x) => x !== g) : [...s, g]));
  const togglePick = (id) => setPicked((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const shown = useMemo(() => {
    let list = all;
    if (groups.length) list = list.filter((e) => groups.includes(e.muscle_group));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || (e.target_part || "").toLowerCase().includes(q));
    }
    return list;
  }, [all, groups, query]);

  // body map shows the added exercises' targets, else the selected groups
  const highlight = pickedExercises.length
    ? [...new Set(pickedExercises.flatMap((e) => (e.body_parts || "").split(",").filter(Boolean)))]
    : musclesForGroups(groups);

  async function submit() {
    if (!name.trim() || !picked.length || busy) return;
    setBusy(true);
    try {
      await onSubmit(name.trim(), pickedExercises);   // may be async (template save)
    } catch {
      /* onSubmit already surfaced the error via toast; keep the builder open */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 pb-24">
      <header className="flex items-center gap-3">
        <button onClick={onCancel} className="rounded-full bg-secondary p-2 active:scale-95">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
      </header>

      {/* body map preview */}
      <section className="rounded-3xl bg-card p-4">
        <div className="mx-auto max-w-[240px]"><BodyMap muscles={highlight} compact /></div>
      </section>

      {/* name */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{nameLabel}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder={namePlaceholder} />
      </div>

      {/* muscle groups */}
      <div>
        <div className="mb-2 text-xs font-medium text-muted-foreground">Muscle groups</div>
        <div className="flex flex-wrap gap-2">
          {GROUPS.map((g) => {
            const on = groups.includes(g);
            return (
              <button key={g} onClick={() => toggleGroup(g)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${on ? "bg-lime text-black" : "bg-secondary text-muted-foreground"}`}>
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* picked summary */}
      {pickedExercises.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">Added ({pickedExercises.length})</div>
          <div className="flex flex-wrap gap-2">
            {pickedExercises.map((e) => (
              <span key={e.id} className="flex items-center gap-1.5 rounded-full bg-lime/15 py-1 pl-3 pr-2 text-xs text-lime">
                {e.name}
                <button onClick={() => togglePick(e.id)} className="rounded-full bg-lime/20 p-0.5"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* search + exercise list */}
      <div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            className={`${inputCls} pl-9`} placeholder="Search exercises…" />
        </div>
        <div className="space-y-2">
          {shown.map((e) => {
            const on = picked.includes(e.id);
            return (
              <button key={e.id} onClick={() => togglePick(e.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left ring-1 transition-colors ${on ? "bg-lime/10 ring-lime" : "bg-card ring-transparent active:bg-secondary"}`}>
                <div>
                  <div className="text-sm font-semibold">{e.name}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-lime/90">{e.target_part}</span>
                    {e.equipment ? ` · ${e.equipment}` : ""}
                  </div>
                </div>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${on ? "bg-lime text-black" : "bg-secondary text-muted-foreground"}`}>
                  {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
            );
          })}
          {shown.length === 0 && (
            <div className="rounded-2xl bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              {groups.length || query.trim() ? "No exercises match." : "Pick a muscle group or search."}
            </div>
          )}

          {/* add a custom exercise */}
          <button onClick={() => setCustomOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground active:border-lime active:text-lime">
            <PlusCircle className="h-4 w-4" /> Add your own exercise
          </button>
        </div>
      </div>

      {/* fixed action bar (sits just above the tab bar, with a fade so the
          list scrolls out of sight behind it instead of showing through) */}
      <div className="fixed inset-x-0 bottom-[76px] z-30 mx-auto max-w-screen-sm bg-gradient-to-t from-background via-background to-transparent px-4 pb-3 pt-8">
        <button disabled={!name.trim() || !picked.length || busy} onClick={submit}
          className="w-full rounded-2xl bg-lime py-3.5 font-bold text-black shadow-lg shadow-black/50 active:scale-[0.98] disabled:opacity-40">
          {busy ? "Saving…" : `${submitLabel}${picked.length ? ` (${picked.length})` : ""}`}
        </button>
      </div>

      {customOpen && (
        <CustomExerciseSheet
          groups={GROUPS}
          defaultGroup={groups[0] || "Chest"}
          onClose={() => setCustomOpen(false)}
          onCreate={createCustom}
        />
      )}
    </div>
  );
}

function CustomExerciseSheet({ groups, defaultGroup, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState(defaultGroup);
  const [target, setTarget] = useState("");
  const [equipment, setEquipment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onCreate({ name: name.trim(), muscle_group: group, target_part: target.trim(), equipment: equipment.trim() });
    } finally { setBusy(false); }
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title="Add your own exercise">
      <form onSubmit={submit}>
        <Field label="Exercise name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Incline Cable Fly" autoFocus />
        </Field>
        <div className="mb-3">
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Target muscle</div>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button key={g} type="button" onClick={() => setGroup(g)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${group === g ? "bg-lime text-black" : "bg-secondary text-muted-foreground"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <Field label="Target part (optional)">
          <input value={target} onChange={(e) => setTarget(e.target.value)} className={inputCls} placeholder="e.g. Upper chest" />
        </Field>
        <Field label="Equipment (optional)">
          <input value={equipment} onChange={(e) => setEquipment(e.target.value)} className={inputCls} placeholder="e.g. Cable" />
        </Field>
        <button disabled={busy || !name.trim()}
          className="mt-1 w-full rounded-xl bg-lime py-3 font-bold text-black active:scale-[0.98] disabled:opacity-50">
          {busy ? "Saving…" : "Add exercise"}
        </button>
      </form>
    </Sheet>
  );
}
