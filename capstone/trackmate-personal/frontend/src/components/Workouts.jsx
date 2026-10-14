import { useEffect, useState } from "react";
import { api } from "../api";

const today = () => new Date().toISOString().slice(0, 10);
const blankSet = () => ({ exercise_id: "", weight_kg: "", reps: "", comment: "" });

export default function Workouts() {
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [date, setDate] = useState(today());
  const [dayLabel, setDayLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState([blankSet()]);
  const [err, setErr] = useState("");

  const load = () => {
    api.get("/exercises").then(setExercises);
    api.get("/workouts").then(setWorkouts);
  };
  useEffect(() => { load(); }, []);

  // group exercises by muscle group for the dropdown
  const grouped = exercises.reduce((acc, e) => {
    (acc[e.muscle_group] = acc[e.muscle_group] || []).push(e);
    return acc;
  }, {});

  const updateSet = (i, key, val) =>
    setSets(sets.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)));

  async function save(e) {
    e.preventDefault();
    setErr("");
    const valid = sets.filter((s) => s.exercise_id);
    if (!dayLabel || valid.length === 0) {
      setErr("Add a day label and at least one exercise set.");
      return;
    }
    await api.post("/workouts", {
      date, day_label: dayLabel, notes,
      sets: valid.map((s, i) => ({
        exercise_id: parseInt(s.exercise_id),
        set_number: i + 1,
        weight_kg: parseFloat(s.weight_kg || 0),
        reps: parseInt(s.reps || 0),
        comment: s.comment,
      })),
    });
    setDayLabel(""); setNotes(""); setSets([blankSet()]); setDate(today());
    load();
  }
  async function del(id) { await api.del(`/workouts/${id}`); load(); }

  return (
    <div className="section-split">
      <form className="card" onSubmit={save}>
        <h3>Log a workout</h3>
        <div className="row">
          <div className="field"><label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="field"><label>Day label</label>
            <input placeholder="Chest + Triceps" value={dayLabel} onChange={(e) => setDayLabel(e.target.value)} /></div>
        </div>

        <label>Exercises</label>
        {sets.map((s, i) => (
          <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <select value={s.exercise_id} onChange={(e) => updateSet(i, "exercise_id", e.target.value)}>
              <option value="">Select exercise…</option>
              {Object.entries(grouped).map(([group, list]) => (
                <optgroup key={group} label={group}>
                  {list.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </optgroup>
              ))}
            </select>
            <div className="row" style={{ marginTop: 8 }}>
              <div className="field" style={{ marginBottom: 0 }}><label>Weight (kg)</label>
                <input type="number" step="0.5" value={s.weight_kg} onChange={(e) => updateSet(i, "weight_kg", e.target.value)} /></div>
              <div className="field" style={{ marginBottom: 0 }}><label>Reps</label>
                <input type="number" value={s.reps} onChange={(e) => updateSet(i, "reps", e.target.value)} /></div>
            </div>
            <input style={{ marginTop: 8 }} placeholder="Comment (optional)" value={s.comment}
              onChange={(e) => updateSet(i, "comment", e.target.value)} />
          </div>
        ))}
        <button type="button" className="secondary small" onClick={() => setSets([...sets, blankSet()])}>+ Add set</button>

        <div className="field" style={{ marginTop: 12 }}><label>Notes</label>
          <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <button style={{ width: "100%" }}>Save workout</button>
        {err && <div className="err">{err}</div>}
      </form>

      <div className="card">
        <h3>Workout history</h3>
        {workouts.map((w) => (
          <div key={w.id} style={{ borderBottom: "1px solid var(--border)", padding: "12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{w.day_label}</strong><span className="muted">{w.date}</span>
            </div>
            <table style={{ marginTop: 6 }}>
              <tbody>
                {w.sets.map((s) => (
                  <tr key={s.id}>
                    <td>{s.exercise_name}</td>
                    <td className="muted">{s.weight_kg} kg × {s.reps}</td>
                    <td className="muted">{s.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {w.notes && <div className="muted" style={{ marginTop: 4 }}>📝 {w.notes}</div>}
            <button className="danger" style={{ marginTop: 8 }} onClick={() => del(w.id)}>Delete</button>
          </div>
        ))}
        {workouts.length === 0 && <div className="muted">No workouts logged yet.</div>}
      </div>
    </div>
  );
}
