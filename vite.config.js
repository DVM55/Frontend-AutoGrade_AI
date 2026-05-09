import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis", // ← thêm dòng này
  },
  server: {
    host: true, // hoặc "0.0.0.0"
    port: 5173,
    allowedHosts: ["excel-assumption-legislation-entities.trycloudflare.com"],
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ["excel-assumption-legislation-entities.trycloudflare.com"],
  },
});
