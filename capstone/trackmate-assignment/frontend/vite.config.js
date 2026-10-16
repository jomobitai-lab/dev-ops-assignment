import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local dev: /api is proxied to the FastAPI server on :8000.
// Production (Vercel): /api is served by the serverless function on the same origin.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    proxy: { "/api": "http://localhost:8000" },
  },
});
