import { useEffect, useState } from "react";
import { api } from "../api";

const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({ date: today(), source: "", amount: "", category: "", note: "" });

export default function Earnings() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty());

  const load = () => api.get("/earnings").then(setRows);
  useEffect(() => { load(); }, []);

  const total = rows.reduce((s, r) => s + r.amount, 0);

  async function add(e) {
    e.preventDefault();
    await api.post("/earnings", { ...form, amount: parseFloat(form.amount) });
    setForm(empty());
    load();
  }
  async function del(id) { await api.del(`/earnings/${id}`); load(); }

  return (
    <div className="section-split">
      <form className="card" onSubmit={add}>
        <h3>Add earning</h3>
        <div className="field"><label>Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div className="field"><label>Source</label>
          <input required placeholder="Freelance, Internship..." value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
        <div className="field"><label>Amount (₹)</label>
          <input type="number" step="0.01" required value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
        <div className="field"><label>Category</label>
          <input placeholder="Web, Content..." value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
        <button style={{ width: "100%" }}>Add</button>
      </form>
      <div className="card">
        <h3>Total earned: <span style={{ color: "var(--accent)" }}>₹{total.toLocaleString("en-IN")}</span></h3>
        <table>
          <thead><tr><th>Date</th><th>Source</th><th>Category</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td><td>{r.source}</td>
                <td><span className="pill">{r.category || "—"}</span></td>
                <td>₹{r.amount.toLocaleString("en-IN")}</td>
                <td style={{ textAlign: "right" }}><button className="danger" onClick={() => del(r.id)}>Delete</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="5" className="muted">No earnings yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
