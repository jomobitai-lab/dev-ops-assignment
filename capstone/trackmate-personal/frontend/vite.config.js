import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In local dev, calls to /api are proxied to the FastAPI server on :8000.
// In production (Vercel), /api is served by the serverless function on the same origin.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
