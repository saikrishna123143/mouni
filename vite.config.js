import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/login": {
        target: "https://apis.ccbp.in",
        changeOrigin: true,
      },
    },
  },
});
