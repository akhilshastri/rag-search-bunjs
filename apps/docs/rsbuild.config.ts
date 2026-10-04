import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";

const REMOTE_ENTRY = process.env.REMOTE_ENTRY ?? "http://localhost:3001/mf-manifest.json";

export default defineConfig({
  server: { port: 3000 },
  source: {
    // Two pages: the docs UI (index.html) and the sandbox runtime (preview.html).
    entry: { index: "./src/entry-index.ts", preview: "./src/entry-preview.ts" },
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "docs",
      remotes: { remote: `remote@${REMOTE_ENTRY}` },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "@demo/ui": { singleton: true, requiredVersion: false },
      },
    }),
  ],
});
