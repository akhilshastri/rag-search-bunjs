import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";

export default defineConfig({
  server: { port: 3001, headers: { "Access-Control-Allow-Origin": "*" } },
  dev: { assetPrefix: "http://localhost:3001/" },
  source: { entry: { index: "./src/entry.ts" } },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "remote",
      exposes: {
        "./Counter": "./src/Counter.tsx",
        "./Rating": "./src/Rating.tsx",
        "./StatCard": "./src/StatCard.tsx",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "@demo/ui": { singleton: true, requiredVersion: false },
      },
    }),
  ],
});
