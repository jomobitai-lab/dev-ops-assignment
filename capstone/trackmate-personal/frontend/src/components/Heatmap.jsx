// A GitHub-style activity calendar heatmap for workout days.
export default function Heatmap({ activity = [], weeks = 18 }) {
  const counts = {};
  activity.forEach((a) => (counts[a.date] = a.count));

  const level = (c) => (!c ? "" : c >= 4 ? "hm-4" : c === 3 ? "hm-3" : c === 2 ? "hm-2" : "hm-1");
  const iso = (d) => d.toISOString().slice(0, 10);

  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  start.setDate(start.getDate() - start.getDay()); // back up to Sunday

  const cells = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = iso(d);
    cells.push(
      <div key={key} className={`hm-cell ${level(counts[key])}`} title={`${key}: ${counts[key] || 0} workout(s)`} />
    );
  }

  return (
    <div>
      <div className="heatmap">{cells}</div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
        Less
        <span className="hm-cell" /><span className="hm-cell hm-1" /><span className="hm-cell hm-2" />
        <span className="hm-cell hm-3" /><span className="hm-cell hm-4" />
        More
      </div>
    </div>
  );
}
