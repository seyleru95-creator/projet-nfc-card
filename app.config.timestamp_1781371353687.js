// app.config.ts
import { defineConfig } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()]
  }
});
export {
  app_config_default as default
};
