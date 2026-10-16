import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Minus, Plus } from "lucide-react";

// Rest timer. Configure the rest length before starting, then count down.
export default function RestTimer({ defaultSeconds = 90 }) {
  const [total, setTotal] = useState(defaultSeconds);
  const [left, setLeft] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setLeft(total); }, [total]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) { clearInterval(ref.current); setRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running]);

  const mmss = `${String(Math.floor(left / 60)).padStart(1, "0")}:${String(left % 60).padStart(2, "0")}`;
  const pct = total > 0 ? left / total : 0;
  const done = left === 0;

  const adjust = (d) => { if (!running) setTotal((t) => Math.max(15, Math.min(600, t + d))); };
  const reset = () => { setRunning(false); setLeft(total); };

  return (
    <div className="rounded-2xl bg-secondary p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Rest timer</span>
        {!running && (
          <div className="flex items-center gap-2">
            <button onClick={() => adjust(-15)} className="rounded-md bg-background p-1"><Minus className="h-3.5 w-3.5" /></button>
            <span className="w-10 text-center text-xs tabular-nums text-muted-foreground">{total}s</span>
            <button onClick={() => adjust(15)} className="rounded-md bg-background p-1"><Plus className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className={`text-3xl font-extrabold tabular-nums ${done ? "text-lime" : ""}`}>{mmss}</div>
        <div className="flex-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
        <button onClick={() => (done ? reset() : setRunning((r) => !r))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-lime text-black active:scale-95">
          {done ? <RotateCcw className="h-5 w-5" /> : running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        {!done && (
          <button onClick={reset} className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground active:scale-95">
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
      {done && <div className="mt-2 text-center text-xs font-semibold text-lime">Rest done — next set!</div>}
    </div>
  );
}
