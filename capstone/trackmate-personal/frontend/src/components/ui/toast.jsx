import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Check, AlertCircle, X } from "lucide-react";
import { ApiError } from "../../api";

const ToastCtx = createContext(null);

// Format any value (string or ApiError/Error) into a short toast line.
function format(input) {
  if (input instanceof ApiError) {
    const code = input.status ? ` (${input.status})` : "";
    return `${input.message}${code}`;
  }
  if (input instanceof Error) return input.message;
  return String(input);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((type, input) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, type, text: format(input) }]);
    setTimeout(() => dismiss(id), type === "error" ? 5000 : 3000);
  }, [dismiss]);

  const api = useRef({
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  }).current;

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] mx-auto flex max-w-screen-sm flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function Toast({ toast, onClose }) {
  const isErr = toast.type === "error";
  const Icon = isErr ? AlertCircle : Check;
  return (
    <div
      role="status"
      onClick={onClose}
      className="pointer-events-auto flex w-full items-start gap-2.5 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg shadow-black/40 backdrop-blur animate-in"
      style={{ animation: "toastIn .2s ease" }}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isErr ? "bg-destructive/20 text-destructive" : "bg-lime/20 text-lime"}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.6} />
      </span>
      <span className="flex-1 text-sm leading-snug">{toast.text}</span>
      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
