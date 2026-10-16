import Model from "react-body-highlighter";

// Anatomical body map: front (anterior) + back (posterior) shown together.
// Display only — it highlights the muscles passed in `muscles` (library keys).
// No flip, no tapping to pick exercises.
const LIME = "#c6ff2e";
const BODY = "#242424";

export default function BodyMap({ muscles = [], compact = false }) {
  const data = [{ name: "target", muscles }];
  const svgStyle = { width: "100%" };
  return (
    <div className="flex items-start justify-center gap-3">
      <div className="flex flex-1 flex-col items-center">
        <Model
          data={data}
          type="anterior"
          highlightedColors={[LIME]}
          bodyColor={BODY}
          svgStyle={svgStyle}
          style={{ width: "100%" }}
        />
        {!compact && <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Front</span>}
      </div>
      <div className="flex flex-1 flex-col items-center">
        <Model
          data={data}
          type="posterior"
          highlightedColors={[LIME]}
          bodyColor={BODY}
          svgStyle={svgStyle}
          style={{ width: "100%" }}
        />
        {!compact && <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Back</span>}
      </div>
    </div>
  );
}

// Map our muscle-group names -> body-highlighter muscle keys (for group highlight).
export const GROUP_MUSCLES = {
  Chest: ["chest"],
  Back: ["upper-back", "lower-back", "trapezius"],
  Legs: ["quadriceps", "hamstring", "calves", "gluteal"],
  Shoulders: ["front-deltoids", "back-deltoids"],
  Biceps: ["biceps"],
  Triceps: ["triceps"],
  Forearms: ["forearm"],
  Core: ["abs", "obliques"],
};

// Expand a list of group names into the muscles to highlight.
export function musclesForGroups(groups = []) {
  const out = new Set();
  groups.forEach((g) => (GROUP_MUSCLES[g] || []).forEach((m) => out.add(m)));
  return [...out];
}
