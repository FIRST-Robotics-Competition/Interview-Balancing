import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://frc-api.firstinspires.org/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log(
              "Sending Request:",
              req.method,
              "[",
              req.url,
              "]",
              " => TO THE TARGET =>  ",
              proxyReq.method,
              proxyReq.protocol,
              proxyReq.host,
              proxyReq.path,
            );

            console.log(JSON.stringify(proxyReq.getHeaders(), undefined, 2));
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url,
              JSON.stringify(proxyRes.headers),
            );
          });
        },
      },
    },
  },
});
