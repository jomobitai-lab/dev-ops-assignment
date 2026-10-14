import { useEffect, useState } from "react";
import { api } from "../api";

const GOALS = [
  ["weight", "Target weight", "kg"],
  ["calories", "Daily calories target", "kcal"],
  ["protein", "Daily protein target", "g"],
  ["savings", "Savings goal", "₹"],
];

export default function Goals() {
  const [values, setValues] = useState({});

  const load = () =>
    api.get("/goals").then((rows) => {
      const v = {};
      rows.forEach((r) => (v[r.type] = r.target_value));
      setValues(v);
    });
  useEffect(() => { load(); }, []);

  async function save(type) {
    await api.put("/goals", { type, target_value: parseFloat(values[type] || 0) });
    load();
  }

  return (
    <div className="grid grid-2">
      {GOALS.map(([type, label, unit]) => (
        <div className="card" key={type}>
          <h3>{label}</h3>
          <div className="row" style={{ alignItems: "flex-end" }}>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <label>Target ({unit})</label>
              <input type="number" step="0.1" value={values[type] ?? ""}
                onChange={(e) => setValues({ ...values, [type]: e.target.value })} />
            </div>
            <button className="small" onClick={() => save(type)}>Save</button>
          </div>
        </div>
      ))}
    </div>
  );
}
