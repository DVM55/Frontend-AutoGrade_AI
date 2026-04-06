import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // hoặc "0.0.0.0"
    port: 5173,
    allowedHosts: ["identification-conflict-orleans-blend.trycloudflare.com"],
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ["identification-conflict-orleans-blend.trycloudflare.com"],
  },
});
