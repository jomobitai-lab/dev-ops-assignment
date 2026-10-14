import { useEffect, useState } from "react";
import { api } from "../api";

const today = () => new Date().toISOString().slice(0, 10);

export default function BodyWeight() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ date: today(), weight_kg: "" });

  const load = () => api.get("/body-weight").then(setRows);
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    await api.post("/body-weight", { date: form.date, weight_kg: parseFloat(form.weight_kg) });
    setForm({ date: today(), weight_kg: "" });
    load();
  }
  async function del(id) { await api.del(`/body-weight/${id}`); load(); }

  return (
    <div className="section-split">
      <form className="card" onSubmit={add}>
        <h3>Log weight</h3>
        <div className="field"><label>Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div className="field"><label>Weight (kg)</label>
          <input type="number" step="0.1" required value={form.weight_kg}
            onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></div>
        <button style={{ width: "100%" }}>Add</button>
      </form>
      <div className="card">
        <h3>History</h3>
        <table>
          <thead><tr><th>Date</th><th>Weight</th><th></th></tr></thead>
          <tbody>
            {rows.slice().reverse().map((r) => (
              <tr key={r.id}><td>{r.date}</td><td>{r.weight_kg} kg</td>
                <td style={{ textAlign: "right" }}><button className="danger" onClick={() => del(r.id)}>Delete</button></td></tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="3" className="muted">No entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
