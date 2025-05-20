import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import commonjs from "vite-plugin-commonjs"; // Import the CommonJS plugin

export default defineConfig({
  plugins: [react(), commonjs()], // Add the CommonJS plugin to the plugins array
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@admin": path.resolve(__dirname, "./src/AdminPages"),
    },
  },
  server: {
    port: 5174, // Changed the frontend development server port to 5174
    hmr: {
      port: 5174, // Ensure WebSocket connections use the same port
    },
  },
  optimizeDeps: {
    include: ["jwt-decode"],
  },
});
