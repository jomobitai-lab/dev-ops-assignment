import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../api";
import MacroRings from "../components/widgets/MacroRings.jsx";
import { Sheet, Field, inputCls } from "../components/ui/sheet.jsx";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function NutritionScreen() {
  const [rows, setRows] = useState([]);
  const [goals, setGoals] = useState({});
  const [open, setOpen] = useState(false);

  const load = () => {
    api.get("/nutrition").then(setRows).catch(() => {});
    api.get("/goals").then((g) => {
      const m = {}; g.forEach((x) => (m[x.type] = x.target_value)); setGoals(m);
    }).catch(() => {});
  };
  useEffect(load, []);

  const today = rows.find((r) => r.date === todayISO());

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
        <MacroRings
          calories={today?.calories ?? 0} calorieTarget={goals.calories}
          protein={today?.protein_g ?? 0} proteinTarget={goals.protein}
          carbs={today?.carbs_g ?? 0} fat={today?.fat_g ?? 0}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">History</h2>
        <div className="space-y-2">
          {rows.slice().reverse().map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
              <div>
                <div className="text-sm font-semibold">{r.date}</div>
                <div className="text-xs text-muted-foreground">
                  {r.protein_g}P · {r.carbs_g}C · {r.fat_g}F
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold tabular-nums">{r.calories}<span className="text-xs font-normal text-muted-foreground"> kcal</span></span>
                <button onClick={async () => { await api.del(`/nutrition/${r.id}`); load(); }}
                  className="text-muted-foreground active:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <Empty text="No entries yet." />}
        </div>
      </section>

      <LogSheet open={open} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />
    </div>
  );
}

function LogSheet({ open, onClose, onSaved }) {
  const [f, setF] = useState({ date: todayISO(), calories: "", protein_g: "", carbs_g: "", fat_g: "" });
  async function save(e) {
    e.preventDefault();
    await api.post("/nutrition", {
      date: f.date, calories: parseInt(f.calories || 0),
      protein_g: parseFloat(f.protein_g || 0), carbs_g: parseFloat(f.carbs_g || 0), fat_g: parseFloat(f.fat_g || 0),
    });
    onSaved();
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
        <button className="mt-1 w-full rounded-xl bg-lime py-3 font-bold text-black active:scale-[0.98]">Save</button>
      </form>
    </Sheet>
  );
}

function Empty({ text }) {
  return <div className="rounded-2xl bg-card px-4 py-6 text-center text-sm text-muted-foreground">{text}</div>;
}
