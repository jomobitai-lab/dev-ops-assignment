// A row of stats wrapped in corner brackets (the "corner frame" look).
function Corners() {
  const c = "absolute h-3 w-3 border-muted-foreground/70";
  return (
    <>
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} left-0 bottom-0 border-l border-b`} />
      <span className={`${c} right-0 bottom-0 border-r border-b`} />
    </>
  );
}

export default function CornerStats({ items = [] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((it) => (
        <div key={it.label} className="relative px-4 py-4">
          <Corners />
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {it.label}
          </div>
          <div className="mt-1 text-xl font-bold tabular-nums">{it.value}</div>
        </div>
      ))}
    </div>
  );
}
