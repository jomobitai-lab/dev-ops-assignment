import { useEffect, useState } from "react";
import { Trophy, Plus, Trash2, Check } from "lucide-react";
import { api } from "../../api";
import { Sheet, Field, inputCls } from "../ui/sheet.jsx";
import BodyMap from "../widgets/BodyMap.jsx";
import RestTimer from "../widgets/RestTimer.jsx";

// Detail + logging for one exercise during an active session.
export default function ExerciseSheet({ exercise, defaultRest = 90, onUpdate, onClose }) {
  const [last, setLast] = useState(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [comment, setComment] = useState("");

  const sets = exercise.sets || [];
  const muscles = (exercise.body_parts || "").split(",").filter(Boolean);

  useEffect(() => {
    api.get(`/exercises/${exercise.id}/last`).then(setLast).catch(() => setLast(null));
  }, [exercise.id]);

  // prefill weight from the previous set or last session
  useEffect(() => {
    if (sets.length) setWeight(String(sets[sets.length - 1].weight));
    else if (last?.last_best_weight != null) setWeight(String(last.last_best_weight));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sets.length, last]);

  function logSet(e) {
    e.preventDefault();
    if (!weight && !reps) return;
    const next = [...sets, { weight: parseFloat(weight || 0), reps: parseInt(reps || 0), comment: comment || "" }];
    onUpdate({ ...exercise, sets: next });
    setReps(""); setComment("");
  }
  const removeSet = (i) => onUpdate({ ...exercise, sets: sets.filter((_, idx) => idx !== i) });
  const markComplete = () => { onUpdate({ ...exercise, done: true }); onClose(); };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={exercise.name}>
      <div className="mb-3 text-xs text-muted-foreground">
        <span className="text-lime">{exercise.target_part}</span>
        {exercise.muscle_group ? ` · ${exercise.muscle_group}` : ""}
      </div>

      {/* target on the body */}
      {muscles.length > 0 && (
        <div className="mb-4 rounded-2xl bg-secondary p-3">
          <div className="mx-auto max-w-[200px]"><BodyMap muscles={muscles} compact /></div>
        </div>
      )}

      {/* PR + last record */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-secondary p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-lime"><Trophy className="h-3.5 w-3.5" /> PR</div>
          <div className="mt-1 text-lg font-bold tabular-nums">
            {last?.pr_weight != null ? `${last.pr_weight} kg` : "—"}
          </div>
        </div>
        <div className="rounded-2xl bg-secondary p-3">
          <div className="text-xs font-semibold text-muted-foreground">Last time</div>
          {last?.last_date ? (
            <>
              <div className="mt-1 text-lg font-bold tabular-nums">{last.last_best_weight} kg
                <span className="text-xs font-normal text-muted-foreground"> ×{last.last_best_reps}</span></div>
              <div className="text-[10px] text-muted-foreground">{last.last_date}</div>
            </>
          ) : <div className="mt-1 text-sm text-muted-foreground">First time</div>}
        </div>
      </div>
      {last?.last_comment && (
        <div className="mb-4 rounded-xl bg-secondary px-3 py-2 text-xs italic text-muted-foreground">“{last.last_comment}”</div>
      )}

      {/* sets logged this session */}
      {sets.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {sets.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2 text-sm">
              <span className="text-muted-foreground">Set {i + 1}</span>
              <span className="font-semibold tabular-nums">{s.weight} kg × {s.reps}{s.comment ? "  ·  " : ""}<span className="font-normal text-muted-foreground">{s.comment}</span></span>
              <button onClick={() => removeSet(i)} className="text-muted-foreground active:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {/* log next set */}
      <form onSubmit={logSet} className="mb-4">
        <div className="mb-1 text-xs font-medium text-muted-foreground">Set {sets.length + 1}</div>
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
        <Field label="Comment (e.g. dropset 15kg +18 reps)">
          <input value={comment} onChange={(e) => setComment(e.target.value)} className={inputCls} placeholder="optional" />
        </Field>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime py-3 font-bold text-black active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Log set
        </button>
      </form>

      {/* rest timer */}
      <div className="mb-4">
        <RestTimer defaultSeconds={defaultRest} />
      </div>

      <button onClick={markComplete}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 font-semibold active:scale-[0.98]">
        <Check className="h-4 w-4 text-lime" /> Mark exercise complete
      </button>
    </Sheet>
  );
}
