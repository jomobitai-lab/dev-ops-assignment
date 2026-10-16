import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../api";
import MacroDonut from "../components/widgets/MacroDonut.jsx";
import { Sheet, Field, inputCls } from "../components/ui/sheet.jsx";
import { useToast } from "../components/ui/toast.jsx";
import { useFetch, ErrorState, Skeleton } from "../components/ui/feedback.jsx";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function NutritionScreen() {
  const toast = useToast();
  const nutri = useFetch("/nutrition");
  const goalsQ = useFetch("/goals");
  const [open, setOpen] = useState(false);

  const rows = nutri.data || [];
  const goals = {};
  (goalsQ.data || []).forEach((x) => (goals[x.type] = x.target_value));
  const today = rows.find((r) => r.date === todayISO());

  async function del(id) {
    try { await api.del(`/nutrition/${id}`); toast.success("Deleted"); nutri.reload(); }
    catch (err) { toast.error(err); }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Nutrition</h1>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1 rounded-full bg-lime px-4 py-2 text-sm font-bold text-black active:scale-95">
          <Plus className="h-4 w-4" /> Log
        </button>
      </header>

      <section className="rounded-3xl bg-card p-5">
        <div className="mb-4 text-sm font-semibold">Today</div>
        {nutri.loading ? (
          <Skeleton className="h-[150px] !bg-secondary" />
        ) : nutri.error ? (
          <ErrorState error={nutri.error} onRetry={nutri.reload} label="Couldn't load today" />
        ) : (
          <>
            <MacroDonut
              protein={today?.protein_g ?? 0} carbs={today?.carbs_g ?? 0}
              fat={today?.fat_g ?? 0} calories={today?.calories ?? 0}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <TargetBar label="Calories" value={today?.calories ?? 0} target={goals.calories} unit="kcal" />
              <TargetBar label="Protein" value={Math.round(today?.protein_g ?? 0)} target={goals.protein} unit="g" />
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">History</h2>
        {nutri.loading ? (
          <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[62px]" />)}</div>
        ) : nutri.error ? null : (
          <div className="space-y-2">
            {rows.slice().reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">{r.date}</div>
                  <div className="text-xs text-muted-foreground">{r.protein_g}P · {r.carbs_g}C · {r.fat_g}F</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tabular-nums">{r.calories}<span className="text-xs font-normal text-muted-foreground"> kcal</span></span>
                  <button onClick={() => del(r.id)} className="text-muted-foreground active:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {rows.length === 0 && <div className="rounded-2xl bg-card px-4 py-6 text-center text-sm text-muted-foreground">No entries yet.</div>}
          </div>
        )}
      </section>

      <LogSheet open={open} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); nutri.reload(); }} />
    </div>
  );
}

function TargetBar({ label, value, target, unit }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : null;
  return (
    <div className="rounded-xl bg-secondary px-3 py-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{target ? `${value}/${target}` : value} {unit}</span>
      </div>
      {pct != null && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-background">
          <div className="h-full rounded-full bg-lime" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function LogSheet({ open, onClose, onSaved }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ date: todayISO(), calories: "", protein_g: "", carbs_g: "", fat_g: "" });
  async function save(e) {
    e.preventDefault(); setBusy(true);
    try {
      await api.post("/nutrition", {
        date: f.date, calories: parseInt(f.calories || 0),
        protein_g: parseFloat(f.protein_g || 0), carbs_g: parseFloat(f.carbs_g || 0), fat_g: parseFloat(f.fat_g || 0),
      });
      toast.success("Logged"); onSaved();
    } catch (err) { toast.error(err); } finally { setBusy(false); }
  }
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} title="Log nutrition">
      <form onSubmit={save}>
        <Field label="Date">
          <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Calories (kcal)">
          <input type="number" inputMode="numeric" value={f.calories}
            onChange={(e) => setF({ ...f, calories: e.target.value })} className={inputCls} placeholder="2200" required />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Protein"><input type="number" value={f.protein_g} onChange={(e) => setF({ ...f, protein_g: e.target.value })} className={inputCls} placeholder="g" /></Field>
          <Field label="Carbs"><input type="number" value={f.carbs_g} onChange={(e) => setF({ ...f, carbs_g: e.target.value })} className={inputCls} placeholder="g" /></Field>
          <Field label="Fat"><input type="number" value={f.fat_g} onChange={(e) => setF({ ...f, fat_g: e.target.value })} className={inputCls} placeholder="g" /></Field>
        </div>
        <button disabled={busy} className="mt-1 w-full rounded-xl bg-lime py-3 font-bold text-black active:scale-[0.98] disabled:opacity-60">
          {busy ? "Saving…" : "Save"}
        </button>
      </form>
    </Sheet>
  );
}
