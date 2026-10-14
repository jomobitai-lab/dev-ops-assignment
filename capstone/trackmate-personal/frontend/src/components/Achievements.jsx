import { useEffect, useState } from "react";
import { api } from "../api";

const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({ date: today(), title: "", description: "" });

export default function Achievements() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty());

  const load = () => api.get("/achievements").then(setRows);
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    await api.post("/achievements", form);
    setForm(empty());
    load();
  }
  async function del(id) { await api.del(`/achievements/${id}`); load(); }

  return (
    <div className="section-split">
      <form className="card" onSubmit={add}>
        <h3>Add achievement</h3>
        <div className="field"><label>Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div className="field"><label>Title</label>
          <input required placeholder="e.g. First 100kg deadlift" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="field"><label>Description</label>
          <textarea rows="3" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <button style={{ width: "100%" }}>Add</button>
      </form>
      <div className="card">
        <h3>Your achievements 🏆</h3>
        {rows.map((r) => (
          <div key={r.id} style={{ borderBottom: "1px solid var(--border)", padding: "12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{r.title}</strong>
              <span className="muted">{r.date}</span>
            </div>
            {r.description && <div className="muted" style={{ marginTop: 4 }}>{r.description}</div>}
            <button className="danger" style={{ marginTop: 8 }} onClick={() => del(r.id)}>Delete</button>
          </div>
        ))}
        {rows.length === 0 && <div className="muted">No achievements yet — add your first win!</div>}
      </div>
    </div>
  );
}
