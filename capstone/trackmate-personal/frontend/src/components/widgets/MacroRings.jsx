import Ring from "./Ring.jsx";

// Data-driven macro rings (replaces the self-contained dither donut demo).
// Shows today's calories as the big ring + protein/carbs/fat as small rings.
export default function MacroRings({
  calories = 0, calorieTarget, protein = 0, proteinTarget,
  carbs = 0, fat = 0,
}) {
  const kcalMax = calorieTarget || Math.max(calories, 2000);
  const pMax = proteinTarget || Math.max(protein, 150);
  return (
    <div className="flex items-center justify-between gap-4">
      <Ring
        value={calories} max={kcalMax} size={132} stroke={12} color="#c6ff2e"
        center={
          <>
            <div className="text-2xl font-extrabold tabular-nums leading-none">{calories}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">kcal</div>
            {calorieTarget ? (
              <div className="mt-1 text-[10px] text-muted-foreground">of {calorieTarget}</div>
            ) : null}
          </>
        }
      />
      <div className="flex flex-1 flex-col gap-3">
        <Ring value={protein} max={pMax} size={56} stroke={7} color="#c6ff2e"
          center={<div className="text-[11px] font-bold tabular-nums">{Math.round(protein)}</div>}
          label="Protein" />
        <div className="grid grid-cols-2 gap-3">
          <MiniBar label="Carbs" value={Math.round(carbs)} unit="g" />
          <MiniBar label="Fat" value={Math.round(fat)} unit="g" />
        </div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, unit }) {
  return (
    <div className="rounded-xl bg-secondary px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-base font-bold tabular-nums">
        {value}<span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
