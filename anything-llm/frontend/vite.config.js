import dotenv from "dotenv";
import path from "path";
import {defineConfig} from "vite";
import postcss from "./postcss.config.js";
import react from "@vitejs/plugin-react";
import dns from "dns";
import {visualizer} from "rollup-plugin-visualizer";

if (process.env.NODE_ENV === "development") {
  const envPath = path.resolve(__dirname, '../../client-files/.env');
  dotenv.config({path: envPath});
} else {
  dotenv.config();
}

dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    host: "localhost"
  },
  define: {
    "process.env": process.env
  },
  css: {
    postcss
  },
  plugins: [
    react(),
    visualizer({
      template: "treemap", // or sunburst
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "bundleinspector.html" // will be saved in project's root
    })
  ],
  resolve: {
    alias: [
      {
        process: "process/browser",
        stream: "stream-browserify",
        zlib: "browserify-zlib",
        util: "util",
        find: /^~.+/,
        replacement: (val) => {
          return val.replace(/^~/, "");
        }
      }
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    exclude: ["fsevents"],
    esbuildOptions: {
      define: {
        global: "globalThis"
      },
      plugins: []
    }
  }
})
