import { useEffect, useState } from "react";
import { api } from "../api";

const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({ date: today(), sleep_time: `${today()}T23:00`, wake_time: `${today()}T07:00` });

export default function Sleep() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty());

  const load = () => api.get("/sleep").then(setRows);
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    await api.post("/sleep", {
      date: form.date,
      sleep_time: form.sleep_time,
      wake_time: form.wake_time,
    });
    setForm(empty());
    load();
  }
  async function del(id) { await api.del(`/sleep/${id}`); load(); }

  const fmt = (s) => new Date(s).toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });

  return (
    <div className="section-split">
      <form className="card" onSubmit={add}>
        <h3>Log sleep</h3>
        <div className="field"><label>Night of</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div className="field"><label>Went to sleep</label>
          <input type="datetime-local" value={form.sleep_time}
            onChange={(e) => setForm({ ...form, sleep_time: e.target.value })} /></div>
        <div className="field"><label>Woke up</label>
          <input type="datetime-local" value={form.wake_time}
            onChange={(e) => setForm({ ...form, wake_time: e.target.value })} /></div>
        <button style={{ width: "100%" }}>Add</button>
      </form>
      <div className="card">
        <h3>Sleep history</h3>
        <table>
          <thead><tr><th>Date</th><th>Slept</th><th>Woke</th><th>Hours</th><th></th></tr></thead>
          <tbody>
            {rows.slice().reverse().map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td><td>{fmt(r.sleep_time)}</td><td>{fmt(r.wake_time)}</td>
                <td><span className="pill">{r.hours} h</span></td>
                <td style={{ textAlign: "right" }}><button className="danger" onClick={() => del(r.id)}>Delete</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="5" className="muted">No sleep logs yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
