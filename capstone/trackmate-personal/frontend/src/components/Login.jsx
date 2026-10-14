import { useState } from "react";
import { api, setToken } from "../api";

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { token } = await api.login(password);
      setToken(token);
      onLogin();
    } catch {
      setErr("Wrong password, try again.");
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>Track<span style={{ color: "var(--accent)" }}>Mate</span></h1>
        <p>Your personal progress tracker</p>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button style={{ width: "100%", marginTop: 14 }}>Log in</button>
        {err && <div className="err">{err}</div>}
      </form>
    </div>
  );
}
