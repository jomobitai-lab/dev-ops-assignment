import { useEffect, useState } from "react";
import { api } from "../api";

const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({ date: today(), calories: "", protein_g: "", carbs_g: "", fat_g: "" });

export default function Nutrition() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty());

  const load = () => api.get("/nutrition").then(setRows);
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    await api.post("/nutrition", {
      date: form.date,
      calories: parseInt(form.calories || 0),
      protein_g: parseFloat(form.protein_g || 0),
      carbs_g: parseFloat(form.carbs_g || 0),
      fat_g: parseFloat(form.fat_g || 0),
    });
    setForm(empty());
    load();
  }
  async function del(id) { await api.del(`/nutrition/${id}`); load(); }

  return (
    <div className="section-split">
      <form className="card" onSubmit={add}>
        <h3>Log day</h3>
        <div className="field"><label>Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div className="field"><label>Calories (kcal)</label>
          <input type="number" required value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} /></div>
        <div className="row">
          <div className="field"><label>Protein (g)</label>
            <input type="number" value={form.protein_g} onChange={(e) => setForm({ ...form, protein_g: e.target.value })} /></div>
          <div className="field"><label>Carbs (g)</label>
            <input type="number" value={form.carbs_g} onChange={(e) => setForm({ ...form, carbs_g: e.target.value })} /></div>
          <div className="field"><label>Fat (g)</label>
            <input type="number" value={form.fat_g} onChange={(e) => setForm({ ...form, fat_g: e.target.value })} /></div>
        </div>
        <button style={{ width: "100%" }}>Add</button>
      </form>
      <div className="card">
        <h3>History</h3>
        <table>
          <thead><tr><th>Date</th><th>Calories</th><th>P</th><th>C</th><th>F</th><th></th></tr></thead>
          <tbody>
            {rows.slice().reverse().map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td><td>{r.calories} kcal</td>
                <td>{r.protein_g}g</td><td>{r.carbs_g}g</td><td>{r.fat_g}g</td>
                <td style={{ textAlign: "right" }}><button className="danger" onClick={() => del(r.id)}>Delete</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="6" className="muted">No entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
