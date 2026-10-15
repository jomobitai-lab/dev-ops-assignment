import { useState } from "react";

// Stylized interactive body map. Tap a muscle to select that group.
// Groups match the backend muscle_group values.
const LIME = "#c6ff2e";
const BASE = "#1d1d1d";
const BASE_STROKE = "#2f2f2f";

// Each region is a set of SVG shapes for a muscle group, per view.
const FRONT = {
  Shoulders: [["ellipse", 88, 80, 15, 11], ["ellipse", 152, 80, 15, 11]],
  Chest: [["rect", 96, 92, 20, 26, 6], ["rect", 124, 92, 20, 26, 6]],
  Core: [["rect", 104, 122, 32, 46, 7]],
  Biceps: [["rect", 66, 92, 16, 38, 8], ["rect", 158, 92, 16, 38, 8]],
  Forearms: [["rect", 62, 134, 15, 42, 7], ["rect", 163, 134, 15, 42, 7]],
  Legs: [["rect", 90, 214, 24, 92, 10], ["rect", 126, 214, 24, 92, 10]],
};
const BACK = {
  Shoulders: [["ellipse", 88, 80, 15, 11], ["ellipse", 152, 80, 15, 11]],
  Back: [["rect", 94, 90, 52, 64, 9]],
  Triceps: [["rect", 66, 92, 16, 38, 8], ["rect", 158, 92, 16, 38, 8]],
  Forearms: [["rect", 62, 134, 15, 42, 7], ["rect", 163, 134, 15, 42, 7]],
  Legs: [["rect", 96, 196, 48, 18, 8], ["rect", 90, 216, 24, 92, 10], ["rect", 126, 216, 24, 92, 10]],
};

function Shape({ s, active, onClick, group }) {
  const common = {
    onClick,
    "data-muscle": group,
    style: { cursor: "pointer", transition: "fill .15s, filter .15s" },
    fill: active ? LIME : BASE,
    stroke: active ? LIME : BASE_STROKE,
    strokeWidth: 1.5,
    fillOpacity: active ? 0.9 : 1,
    filter: active ? "drop-shadow(0 0 5px rgba(198,255,46,0.6))" : "none",
  };
  if (s[0] === "ellipse")
    return <ellipse cx={s[1]} cy={s[2]} rx={s[3]} ry={s[4]} {...common} />;
  return <rect x={s[1]} y={s[2]} width={s[3]} height={s[4]} rx={s[5]} {...common} />;
}

export default function BodyMap({ selected = [], onToggle }) {
  const [view, setView] = useState("front");
  const regions = view === "front" ? FRONT : BACK;

  return (
    <div className="flex flex-col items-center">
      {/* front / back toggle */}
      <div className="mb-3 flex rounded-full bg-secondary p-1 text-xs">
        {["front", "back"].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-full px-4 py-1 capitalize transition-colors ${
              view === v ? "bg-lime text-black font-semibold" : "text-muted-foreground"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 240 440" className="h-[320px] w-auto">
        {/* base silhouette */}
        <circle cx="120" cy="34" r="19" fill={BASE} stroke={BASE_STROKE} strokeWidth="1.5" />
        <rect x="112" y="50" width="16" height="12" fill={BASE} />
        <rect x="80" y="60" width="80" height="112" rx="18" fill={BASE} stroke={BASE_STROKE} strokeWidth="1.5" />
        <rect x="88" y="168" width="64" height="52" rx="12" fill={BASE} stroke={BASE_STROKE} strokeWidth="1.5" />
        {/* muscle regions */}
        {Object.entries(regions).map(([group, shapes]) =>
          shapes.map((s, i) => (
            <Shape
              key={group + i}
              s={s}
              group={group}
              active={selected.includes(group)}
              onClick={() => onToggle(group)}
            />
          ))
        )}
      </svg>

      <div className="mt-1 text-xs text-muted-foreground">
        Tap a muscle to add it to today's session
      </div>
    </div>
  );
}
