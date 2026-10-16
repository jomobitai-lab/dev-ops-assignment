import { useEffect, useState } from "react";
import { Plus, Trash2, Moon, Wallet, Award, Target, LogOut, User } from "lucide-react";
import { api } from "../api";
import { Sheet, Field, inputCls } from "../components/ui/sheet.jsx";
import { useToast } from "../components/ui/toast.jsx";
import { useFetch, ErrorState, Skeleton } from "../components/ui/feedback.jsx";

const todayISO = () => new Date().toISOString().slice(0, 10);
const TABS = [["profile", "Profile", User], ["goals", "Goals", Target], ["sleep", "Sleep", Moon], ["earnings", "Earnings", Wallet], ["wins", "Wins", Award]];

export default function MoreScreen({ onLogout }) {
  const [tab, setTab] = useState("profile");
  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">More</h1>
        <button onClick={onLogout} className="flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-2 text-sm text-muted-foreground active:text-foreground">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === key ? "bg-lime text-black" : "bg-secondary text-muted-foreground"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "goals" && <GoalsTab />}
      {tab === "sleep" && <SleepTab />}
      {tab === "earnings" && <EarningsTab />}
      {tab === "wins" && <WinsTab />}
    </div>
  );
}

// ---------- shared bits ----------
function AddBtn({ onClick, label }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground active:border-lime active:text-lime">
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}
function Empty({ text }) {
  return <div className="rounded-2xl bg-card px-4 py-6 text-center text-sm text-muted-foreground">{text}</div>;
}
function ListSkeleton({ n = 3 }) {
  return <div className="space-y-2">{Array.from({ length: n }).map((_, i) => <Skeleton key={i} className="h-[62px]" />)}</div>;
}
function SubmitBtn({ busy, busyText = "Saving…", children, className = "mt-1 w-full rounded-xl bg-lime py-3 font-bold text-black active:scale-[0.98] disabled:opacity-60" }) {
  return <button disabled={busy} className={className}>{busy ? busyText : children}</button>;
}
const fmt = (s) => new Date(s).toLocaleString([], { hour: "2-digit", minute: "2-digit" });

// ---------- Sleep ----------
function SleepTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch("/sleep");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const rows = data || [];

  const openSheet = () => { setF({ date: todayISO(), sleep_time: `${todayISO()}T23:00`, wake_time: `${todayISO()}T07:00` }); setOpen(true); };
  async function save(e) {
    e.preventDefault(); setBusy(true);
    try {
      await api.post("/sleep", { date: f.date, sleep_time: f.sleep_time, wake_time: f.wake_time });
      setOpen(false); toast.success("Sleep logged"); reload();
    } catch (err) { toast.error(err); } finally { setBusy(false); }
  }
  async function del(id) {
    try { await api.del(`/sleep/${id}`); toast.success("Deleted"); reload(); }
    catch (err) { toast.error(err); }
  }

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} label="Couldn't load sleep logs" />;
  return (
    <div className="space-y-2">
      <AddBtn onClick={openSheet} label="Log sleep" />
      {rows.slice().reverse().map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
          <div>
            <div className="text-sm font-semibold">{r.date}</div>
            <div className="text-xs text-muted-foreground">{fmt(r.sleep_time)} → {fmt(r.wake_time)}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-lime/15 px-2.5 py-1 text-xs font-bold text-lime">{r.hours} h</span>
            <button onClick={() => del(r.id)} className="text-muted-foreground active:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
      {rows.length === 0 && <Empty text="No sleep logs yet." />}
      {open && f && (
        <Sheet open onOpenChange={(o) => !o && setOpen(false)} title="Log sleep">
          <form onSubmit={save}>
            <Field label="Night of"><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inputCls} /></Field>
            <Field label="Went to sleep"><input type="datetime-local" value={f.sleep_time} onChange={(e) => setF({ ...f, sleep_time: e.target.value })} className={inputCls} /></Field>
            <Field label="Woke up"><input type="datetime-local" value={f.wake_time} onChange={(e) => setF({ ...f, wake_time: e.target.value })} className={inputCls} /></Field>
            <SubmitBtn busy={busy}>Save</SubmitBtn>
          </form>
        </Sheet>
      )}
    </div>
  );
}

// ---------- Earnings ----------
function EarningsTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch("/earnings");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ date: todayISO(), source: "", amount: "", category: "", note: "" });
  const rows = data || [];
  const total = rows.reduce((s, r) => s + r.amount, 0);

  async function save(e) {
    e.preventDefault(); setBusy(true);
    try {
      await api.post("/earnings", { ...f, amount: parseFloat(f.amount) });
      setF({ date: todayISO(), source: "", amount: "", category: "", note: "" });
      setOpen(false); toast.success("Earning added"); reload();
    } catch (err) { toast.error(err); } finally { setBusy(false); }
  }
  async function del(id) {
    try { await api.del(`/earnings/${id}`); toast.success("Deleted"); reload(); }
    catch (err) { toast.error(err); }
  }

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} label="Couldn't load earnings" />;
  return (
    <div className="space-y-2">
      <div className="rounded-3xl bg-card p-5">
        <div className="text-xs text-muted-foreground">Total earned</div>
        <div className="text-2xl font-extrabold tabular-nums text-lime">₹{total.toLocaleString("en-IN")}</div>
      </div>
      <AddBtn onClick={() => setOpen(true)} label="Add earning" />
      {rows.slice().reverse().map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
          <div>
            <div className="text-sm font-semibold">{r.source}</div>
            <div className="text-xs text-muted-foreground">{r.date}{r.category ? ` · ${r.category}` : ""}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tabular-nums">₹{r.amount.toLocaleString("en-IN")}</span>
            <button onClick={() => del(r.id)} className="text-muted-foreground active:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
      {rows.length === 0 && <Empty text="No earnings yet." />}
      {open && (
        <Sheet open onOpenChange={(o) => !o && setOpen(false)} title="Add earning">
          <form onSubmit={save}>
            <Field label="Date"><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inputCls} /></Field>
            <Field label="Source"><input required value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} className={inputCls} placeholder="Freelance, internship…" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (₹)"><input type="number" step="0.01" required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} className={inputCls} /></Field>
              <Field label="Category"><input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls} placeholder="Web, content…" /></Field>
            </div>
            <SubmitBtn busy={busy}>Save</SubmitBtn>
          </form>
        </Sheet>
      )}
    </div>
  );
}

// ---------- Wins (achievements) ----------
function WinsTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch("/achievements");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ date: todayISO(), title: "", description: "" });
  const rows = data || [];

  async function save(e) {
    e.preventDefault(); setBusy(true);
    try {
      await api.post("/achievements", f);
      setF({ date: todayISO(), title: "", description: "" });
      setOpen(false); toast.success("Win added 🎉"); reload();
    } catch (err) { toast.error(err); } finally { setBusy(false); }
  }
  async function del(id) {
    try { await api.del(`/achievements/${id}`); toast.success("Deleted"); reload(); }
    catch (err) { toast.error(err); }
  }

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} label="Couldn't load wins" />;
  return (
    <div className="space-y-2">
      <AddBtn onClick={() => setOpen(true)} label="Add a win" />
      {rows.slice().reverse().map((r) => (
        <div key={r.id} className="rounded-2xl bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-lime" />
              <span className="text-sm font-semibold">{r.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{r.date}</span>
              <button onClick={() => del(r.id)} className="text-muted-foreground active:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          {r.description && <p className="mt-1 pl-6 text-xs text-muted-foreground">{r.description}</p>}
        </div>
      ))}
      {rows.length === 0 && <Empty text="No wins logged yet. Celebrate the small ones!" />}
      {open && (
        <Sheet open onOpenChange={(o) => !o && setOpen(false)} title="Add a win">
          <form onSubmit={save}>
            <Field label="Date"><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inputCls} /></Field>
            <Field label="Title"><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} placeholder="First 100kg deadlift!" /></Field>
            <Field label="Notes (optional)"><input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={inputCls} /></Field>
            <SubmitBtn busy={busy}>Save</SubmitBtn>
          </form>
        </Sheet>
      )}
    </div>
  );
}

// ---------- Profile ----------
function ProfileTab() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useFetch("/profile");
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault(); setBusy(true);
    try {
      const saved = await api.put("/profile", {
        name: data.name || "", height_cm: parseFloat(data.height_cm || 0),
        default_rest_seconds: parseInt(data.default_rest_seconds || 90),
        weekly_goal: parseInt(data.weekly_goal || 3),
      });
      setData(saved); toast.success("Profile saved");
    } catch (err) { toast.error(err); } finally { setBusy(false); }
  }

  if (loading) return <Skeleton className="h-80" />;
  if (error) return <ErrorState error={error} onRetry={reload} label="Couldn't load profile" />;
  const p = data;
  return (
    <form onSubmit={save} className="space-y-3 rounded-2xl bg-card p-4">
      <div className="mb-1 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime/15 text-lg font-extrabold text-lime">
          {(p.name || "?").trim().charAt(0).toUpperCase()}
        </span>
        <div className="text-sm text-muted-foreground">Your profile</div>
      </div>
      <Field label="Name"><input value={p.name || ""} onChange={(e) => setData({ ...p, name: e.target.value })} className={inputCls} placeholder="Your name" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Height (cm)"><input type="number" value={p.height_cm || ""} onChange={(e) => setData({ ...p, height_cm: e.target.value })} className={inputCls} /></Field>
        <Field label="Workouts / week"><input type="number" value={p.weekly_goal || ""} onChange={(e) => setData({ ...p, weekly_goal: e.target.value })} className={inputCls} /></Field>
      </div>
      <Field label="Default rest timer (seconds)"><input type="number" value={p.default_rest_seconds || ""} onChange={(e) => setData({ ...p, default_rest_seconds: e.target.value })} className={inputCls} /></Field>
      <SubmitBtn busy={busy} className="w-full rounded-xl bg-lime py-3 font-bold text-black active:scale-[0.98] disabled:opacity-60">Save profile</SubmitBtn>
    </form>
  );
}

// ---------- Goals ----------
const GOAL_DEFS = [
  ["weight", "Target weight", "kg"],
  ["calories", "Daily calories", "kcal"],
  ["protein", "Daily protein", "g"],
  ["savings", "Savings goal", "₹"],
];
function GoalsTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch("/goals");
  const [v, setV] = useState({});
  const [savingType, setSavingType] = useState(null);

  // seed local values from fetched goals once loaded
  useEffect(() => {
    if (data) { const m = {}; data.forEach((r) => (m[r.type] = r.target_value)); setV(m); }
  }, [data]);

  async function save(type) {
    setSavingType(type);
    try {
      await api.put("/goals", { type, target_value: parseFloat(v[type] || 0) });
      toast.success("Goal saved");
    } catch (err) { toast.error(err); } finally { setSavingType(null); }
  }

  if (loading) return <ListSkeleton n={4} />;
  if (error) return <ErrorState error={error} onRetry={reload} label="Couldn't load goals" />;
  return (
    <div className="space-y-2">
      {GOAL_DEFS.map(([type, label, unit]) => (
        <div key={type} className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3">
          <span className="text-sm font-medium">{label}{unit ? ` (${unit})` : ""}</span>
          <div className="flex items-center gap-2">
            <input type="number" step="0.1" value={v[type] ?? ""} onChange={(e) => setV({ ...v, [type]: e.target.value })}
              className="w-24 rounded-lg bg-secondary px-3 py-2 text-right text-sm outline-none ring-1 ring-border focus:ring-lime" />
            <button disabled={savingType === type} onClick={() => save(type)} className="rounded-lg bg-lime px-3 py-2 text-sm font-bold text-black active:scale-95 disabled:opacity-60">
              {savingType === type ? "…" : "Save"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
