import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL ?? "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
