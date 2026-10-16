// Tiny fetch wrapper that adds the auth token and talks to /api/*.
const TOKEN_KEY = "trackmate_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Error type carrying a SHORT message + HTTP status code, so the UI can show
// "something short (code)" instead of a wall of server text.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = network/offline
  }
}

// Turn a failed response body into one short line (no stack traces / HTML).
function shortMessage(raw, status) {
  if (!raw) return `Request failed (${status})`;
  try {
    const j = JSON.parse(raw);
    let d = j.detail ?? j.message ?? j.error ?? raw;
    if (Array.isArray(d)) d = d[0]?.msg || "Invalid input"; // FastAPI validation
    raw = typeof d === "string" ? d : JSON.stringify(d);
  } catch {
    /* not JSON — fall through with raw text */
  }
  raw = String(raw).replace(/\s+/g, " ").trim();
  return raw.length > 90 ? raw.slice(0, 90) + "…" : raw;
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // network down, server unreachable, CORS, etc.
    throw new ApiError("Can't reach the server", 0);
  }

  // Auto-logout only when an AUTHENTICATED request is rejected (expired token).
  // A 401 on login (no token yet) must fall through so the UI can show it.
  if (res.status === 401 && token) {
    clearToken();
    window.location.reload();
    throw new ApiError("Session expired", 401);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(shortMessage(text, res.status), res.status);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: "POST", body }),
  put: (p, body) => request(p, { method: "PUT", body }),
  del: (p) => request(p, { method: "DELETE" }),
  login: (password) => request("/login", { method: "POST", body: { password } }),
};
