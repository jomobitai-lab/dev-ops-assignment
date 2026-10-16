import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { api, ApiError } from "../../api";

// Pulsing placeholder block for skeleton loading screens.
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-card ${className}`} />;
}

// Inline error state for when a page's data fails to load.
export function ErrorState({ error, onRetry, label = "Couldn't load this" }) {
  const code = error instanceof ApiError && error.status ? ` (${error.status})` : "";
  const msg = error?.message || "Something went wrong";
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </span>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">{msg}{code}</div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-medium active:scale-95">
          <RotateCcw className="h-4 w-4" /> Retry
        </button>
      )}
    </div>
  );
}

// Fetch a GET endpoint with loading + error state and a reload() for retries.
export function useFetch(path, { auto = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    return api.get(path)
      .then((d) => { setData(d); return d; })
      .catch((e) => { setError(e); })
      .finally(() => setLoading(false));
  }, [path]);

  useEffect(() => { if (auto) reload(); }, [reload, auto]);

  return { data, loading, error, reload, setData };
}
