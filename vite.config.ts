import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./lib/main.ts",
      name: "react-help-window",
      fileName: "react-help-window",
    },
  },
});
