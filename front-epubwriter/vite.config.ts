import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5183,
    proxy: {
      "/api": { target: "http://localhost:3010" }, // /api 접두어 그대로 전달
    },
  },
  // server: {
  //   port: 5173, // React 포트
  //   proxy: {
  //     // '/api' 또는 '/docu' 로 시작하는 요청을 NestJS(3000번)로 전달
  //     "/docu": {
  //       target: "http://localhost:3000",
  //       changeOrigin: true,
  //     },
  //     "/folders": {
  //       target: "http://localhost:3000",
  //       changeOrigin: true,
  //     },
  //   },
  // },
});
