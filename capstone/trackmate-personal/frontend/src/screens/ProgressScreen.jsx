import { useEffect, useState } from "react";
import { Plus, Trophy, Trash2 } from "lucide-react";
import { api } from "../api";
import GlowArea from "../components/widgets/GlowArea.jsx";
import { Sheet, Field, inputCls } from "../components/ui/sheet.jsx";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ProgressScreen() {
  const [weights, setWeights] = useState([]);
  const [prs, setPrs] = useState([]);
  const [open, setOpen] = useState(false);

  const load = () => {
    api.get("/body-weight").then(setWeights).catch(() => {});
    api.get("/stats/prs").then(setPrs).catch(() => {});
  };
  useEffect(load, []);

  const data = weights.slice(-30).map((w) => ({ label: w.date.slice(5), weight: w.weight_kg }));
  const latest = weights.length ? weights[weights.length - 1].weight_kg : null;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Progress</h1>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1 rounded-full bg-lime px-4 py-2 text-sm font-bold text-black active:scale-95">
          <Plus className="h-4 w-4" /> Weigh in
        </button>
      </header>

      <section className="rounded-3xl bg-card p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Body weight</h2>
          {latest != null && <span className="text-lg font-bold tabular-nums">{latest} <span className="text-xs font-normal text-muted-foreground">kg</span></span>}
        </div>
        {data.length > 1
          ? <GlowArea data={data} dataKey="weight" height={200} domain={["dataMin - 1", "dataMax + 1"]} />
          : <Empty text="Log your weight a few times to see the trend." />}
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-lime" />
          <h2 className="text-sm font-semibold">Personal records</h2>
        </div>
        <div className="space-y-2">
          {prs.map((p) => (
            <div key={p.exercise} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
              <span className="text-sm font-medium">{p.exercise}</span>
              <span className="text-sm font-bold tabular-nums text-lime">{p.max_weight_kg} kg</span>
            </div>
          ))}
          {prs.length === 0 && <Empty text="No records yet — log a workout first." />}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Weigh-in history</h2>
        <div className="space-y-2">
          {weights.slice().reverse().map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
              <span className="text-sm text-muted-foreground">{w.date}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold tabular-nums">{w.weight_kg} kg</span>
                <button onClick={async () => { await api.del(`/body-weight/${w.id}`); load(); }}
                  className="text-muted-foreground active:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {weights.length === 0 && <Empty text="No weigh-ins yet." />}
        </div>
      </section>

      <WeightSheet open={open} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />
    </div>
  );
}

function WeightSheet({ open, onClose, onSaved }) {
  const [f, setF] = useState({ date: todayISO(), weight_kg: "" });
  async function save(e) {
    e.preventDefault();
    await api.post("/body-weight", { date: f.date, weight_kg: parseFloat(f.weight_kg) });
    onSaved();
  }
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} title="Log body weight">
      <form onSubmit={save}>
        <Field label="Date">
          <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Weight (kg)">
          <input type="number" step="0.1" inputMode="decimal" required value={f.weight_kg}
            onChange={(e) => setF({ ...f, weight_kg: e.target.value })} className={inputCls} placeholder="70.5" />
        </Field>
        <button className="mt-1 w-full rounded-xl bg-lime py-3 font-bold text-black active:scale-[0.98]">Save</button>
      </form>
    </Sheet>
  );
}

function Empty({ text }) {
  return <div className="rounded-2xl bg-secondary px-4 py-6 text-center text-sm text-muted-foreground">{text}</div>;
}
