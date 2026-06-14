// app.config.ts
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vinxi";
var app_config_default = defineConfig({
  routers: [],
  vite: {
    plugins: [
      ...tanstackStart(),
      tsconfigPaths(),
      tailwindcss()
    ]
  }
});
export {
  app_config_default as default
};
