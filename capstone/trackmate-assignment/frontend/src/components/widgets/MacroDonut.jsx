import { useEffect, useMemo, useRef } from "react";

// Dithered canvas donut (adapted from the 21st.dev dither-donut component) —
// driven by REAL macros. Protein / carbs / fat -> calorie shares -> wedges.
const SEGMENTS = [
  { key: "Protein", color: "#c6ff2e", kcalPerG: 4 },
  { key: "Carbs", color: "#89c520", kcalPerG: 4 },
  { key: "Fat", color: "#5c7a1a", kcalPerG: 9 },
];

const smoothstep = (min, max, value) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
};
const hash = (x, y) => {
  const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return h - Math.floor(h);
};

function drawRoundedWedge(ctx, cx, cy, rIn, rOut, aStart, aEnd, cr) {
  const sweep = aEnd - aStart;
  if (sweep <= 0.001) return;
  const maxCr = Math.min(cr, (rOut - rIn) / 2, (sweep * rIn) / 2);
  const aStartIn = aStart + maxCr / rIn, aEndIn = aEnd - maxCr / rIn;
  const aStartOut = aStart + maxCr / rOut, aEndOut = aEnd - maxCr / rOut;
  ctx.moveTo(cx + rIn * Math.cos(aStartIn), cy + rIn * Math.sin(aStartIn));
  ctx.arc(cx, cy, rIn, aStartIn, aEndIn);
  ctx.arcTo(cx + rIn * Math.cos(aEnd), cy + rIn * Math.sin(aEnd), cx + rOut * Math.cos(aEnd), cy + rOut * Math.sin(aEnd), maxCr);
  ctx.arcTo(cx + rOut * Math.cos(aEnd), cy + rOut * Math.sin(aEnd), cx + rOut * Math.cos(aEndOut), cy + rOut * Math.sin(aEndOut), maxCr);
  ctx.arc(cx, cy, rOut, aEndOut, aStartOut, true);
  ctx.arcTo(cx + rOut * Math.cos(aStart), cy + rOut * Math.sin(aStart), cx + rIn * Math.cos(aStart), cy + rIn * Math.sin(aStart), maxCr);
  ctx.arcTo(cx + rIn * Math.cos(aStart), cy + rIn * Math.sin(aStart), cx + rIn * Math.cos(aStartIn), cy + rIn * Math.sin(aStartIn), maxCr);
}

export default function MacroDonut({ protein = 0, carbs = 0, fat = 0, calories = 0 }) {
  const canvasRef = useRef(null);
  const rectRef = useRef({ width: 0, height: 0 });
  const sharesRef = useRef([]);
  const timeRef = useRef(0);

  const grams = { Protein: protein, Carbs: carbs, Fat: fat };
  const { shares, legend, hasData } = useMemo(() => {
    const kcals = SEGMENTS.map((s) => grams[s.key] * s.kcalPerG);
    const total = kcals.reduce((a, b) => a + b, 0);
    const sh = total > 0 ? kcals.map((k) => k / total) : [0.34, 0.33, 0.33];
    return {
      shares: sh,
      hasData: total > 0,
      legend: SEGMENTS.map((s, i) => ({ ...s, grams: Math.round(grams[s.key]), pct: Math.round(sh[i] * 100) })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protein, carbs, fat]);

  sharesRef.current = shares;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      rectRef.current = { width: r.width, height: r.height };
    });
    ro.observe(canvas);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf;
    const draw = () => {
      const ctx = canvas.getContext("2d");
      const { width: logW, height: logH } = rectRef.current;
      if (ctx && logW && logH) {
        timeRef.current += reduced ? 0 : 0.02;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = logW * dpr; canvas.height = logH * dpr;
        const logical = 200;
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale((logW * dpr) / logical, (logH * dpr) / logical);

        let startAngle = -Math.PI / 2;
        const gap = 0.08;
        const disp = sharesRef.current;
        for (let i = 0; i < disp.length; i++) {
          const share = disp[i];
          if (share <= 0) { continue; }
          const sweep = share * Math.PI * 2;
          const aStart = startAngle + gap / 2;
          let aEnd = startAngle + sweep - gap / 2;
          if (aEnd < aStart) aEnd = aStart;
          ctx.save();
          ctx.beginPath();
          drawRoundedWedge(ctx, 100, 100, 55, 86, aStart, aEnd, 6);
          ctx.clip();
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = SEGMENTS[i].color;
          const cell = 4.6, t2 = timeRef.current;
          for (let x = 14; x <= 186; x += cell) {
            for (let y = 14; y <= 186; y += cell) {
              const dx = x - 100, dy = y - 100;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 55 - cell || dist > 86 + cell) continue;
              let a = Math.atan2(dy, dx);
              let na = a - aStart;
              while (na < 0) na += Math.PI * 2;
              while (na >= Math.PI * 2) na -= Math.PI * 2;
              if (na > aEnd - aStart) continue;
              const fullness = smoothstep(0.62, 1.0, (dist - 55) / 31);
              const waveRaw = reduced ? 0 : Math.sin(dist * 0.1 - t2) + Math.sin(a * 3 + t2 * 1.5);
              const wave = smoothstep(-1.5, 1.5, waveRaw);
              const jitter = hash(x, y);
              const size = cell * (0.34 + 0.36 * fullness + 0.26 * wave) * (0.78 + 0.42 * jitter);
              ctx.fillRect(x - size / 2, y - size / 2, size, size);
            }
          }
          ctx.restore();
          startAngle += sweep;
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[150px] w-[150px] shrink-0">
        <canvas ref={canvasRef} className="block h-full w-full" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-xl font-extrabold tabular-nums leading-none">{calories}</div>
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground">kcal</div>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {legend.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1 text-xs text-muted-foreground">{s.key}</span>
            <span className="text-sm font-bold tabular-nums">{s.grams}<span className="text-xs font-normal text-muted-foreground">g</span></span>
            {hasData && <span className="w-9 text-right text-[11px] tabular-nums text-muted-foreground">{s.pct}%</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
