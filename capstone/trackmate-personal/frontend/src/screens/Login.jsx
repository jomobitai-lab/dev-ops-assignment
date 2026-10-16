import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { api, setToken, ApiError } from "../api";
import { useToast } from "../components/ui/toast.jsx";

export default function Login({ onLogin }) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const { token } = await api.login(password);
      setToken(token);
      onLogin();
    } catch (e2) {
      if (e2 instanceof ApiError && e2.status === 401) {
        setErr("Wrong password. Try again.");
      } else {
        // server down / network / unexpected — show the real reason
        setErr("Couldn't sign in. Try again.");
        toast.error(e2);
      }
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15">
            <Dumbbell className="h-7 w-7 text-lime" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Track<span className="text-lime">Mate</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Your personal progress tracker</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            autoFocus
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl bg-card px-4 py-3.5 text-base outline-none ring-1 ring-border focus:ring-lime"
          />
          <button
            disabled={busy}
            className="w-full rounded-2xl bg-lime py-3.5 text-base font-bold text-black transition active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Log in"}
          </button>
          {err && <div className="text-center text-sm text-destructive">{err}</div>}
        </form>
      </div>
    </div>
  );
}
