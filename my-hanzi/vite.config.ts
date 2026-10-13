import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";
const apiProxy = {
  "/api": { target: backend, changeOrigin: true },
  "/health": { target: backend, changeOrigin: true },
};

export default defineConfig({
  root: "frontend",
  plugins: [vue()],
  server: {
    host: process.env.HOST ?? "0.0.0.0",
    port: Number(process.env.PORT ?? 8080),
    proxy: apiProxy,
  },
  preview: {
    host: process.env.HOST ?? "0.0.0.0",
    port: Number(process.env.PORT ?? 8080),
    proxy: apiProxy,
  },
  build: {
    outDir: "../dist/frontend",
    emptyOutDir: true,
  },
});