// Data-driven activity heatmap (GitHub-style), last ~17 weeks of workouts.
// Takes [{date:'YYYY-MM-DD', count:n}] and colours each day by workout count.
const WEEKS = 17;

function shade(count) {
  if (!count) return "#1a1a1a";
  if (count >= 3) return "#c6ff2e";
  if (count === 2) return "#9fe600";
  return "#5c7a1a";
}

export default function Heatmap({ data = [] }) {
  const counts = {};
  data.forEach((d) => { counts[d.date] = d.count; });

  // build a grid ending today, aligned so each column is a week (Mon-Sun)
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + (7 - ((end.getDay() + 6) % 7) - 1)); // end of this week (Sun)
  const days = WEEKS * 7;
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ key, count: counts[key] || 0, future: d > today });
  }
  // columns of 7 (week = column)
  const cols = [];
  for (let c = 0; c < WEEKS; c++) cols.push(cells.slice(c * 7, c * 7 + 7));

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-[3px]">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((cell) => (
              <div
                key={cell.key}
                title={`${cell.key}: ${cell.count} workout${cell.count === 1 ? "" : "s"}`}
                className="h-[11px] w-[11px] rounded-[3px]"
                style={{ background: cell.future ? "transparent" : shade(cell.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        {["#1a1a1a", "#5c7a1a", "#9fe600", "#c6ff2e"].map((c) => (
          <span key={c} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
