import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import * as ui from "@demo/ui";
import { loadRemote } from "@module-federation/enhanced/runtime";
import { transform } from "sucrase";
import type { FromPreview, ToPreview } from "./protocol";

/**
 * Sandbox runtime. Runs inside the iframe: receives code from the docs page,
 * transpiles it in the browser, resolves its imports, and renders the default export.
 */

// Modules available to snippets without a network load.
const staticModules: Record<string, unknown> = {
  react: React,
  "react/jsx-runtime": jsxRuntime,
  "@demo/ui": ui,
};

const send = (msg: FromPreview) => parent.postMessage(msg, "*");

let currentRun = 0;

// Make a namespace object look like a transpiled ES module for sucrase's interop helpers.
function asModule(mod: any) {
  if (mod && mod.__esModule) return mod;
  return { ...mod, __esModule: true, default: mod?.default ?? mod };
}

async function resolveModule(spec: string) {
  if (spec in staticModules) return asModule(staticModules[spec]);
  if (spec.startsWith("remote/")) {
    const mod = await loadRemote<any>(spec);
    if (!mod) throw new Error(`Could not load remote module "${spec}"`);
    return asModule(mod);
  }
  throw new Error(`Cannot find module "${spec}". Available: react, @demo/ui, remote/*`);
}

class Boundary extends React.Component<{ id: number; children: React.ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    send({ type: "error", id: this.props.id, message: error.message });
  }
  render() {
    if (this.state.error) {
      return <pre style={{ color: "#b91c1c", whiteSpace: "pre-wrap" }}>{this.state.error.message}</pre>;
    }
    return this.props.children;
  }
}

document.body.style.cssText = "margin:0;padding:16px;font-family:system-ui,sans-serif";
const rootEl = document.getElementById("root")!;
const root = createRoot(rootEl);

async function run(id: number, source: string) {
  currentRun = id;
  const { code } = transform(source, {
    transforms: ["typescript", "jsx", "imports"],
    jsxRuntime: "automatic",
    production: true,
    filePath: "snippet.tsx",
  });

  // Find every import (now require calls) and load them all before executing.
  const specs = [...code.matchAll(/require\((['"])(.+?)\1\)/g)].map((m) => m[2]);
  const loaded: Record<string, unknown> = {};
  for (const spec of new Set(specs)) loaded[spec] = await resolveModule(spec);
  if (id !== currentRun) return; // a newer edit superseded this one

  const module = { exports: {} as any };
  new Function("require", "module", "exports", code)((s: string) => loaded[s], module, module.exports);
  const Component = module.exports.default;
  if (typeof Component !== "function") {
    throw new Error("Your code must `export default` a React component, e.g. export default function Demo() {...}");
  }
  root.render(
    <Boundary id={id} key={id}>
      <Component />
    </Boundary>,
  );
  send({ type: "rendered", id });
}

// Forward console output and uncaught errors to the docs page.
const fmt = (a: unknown) => {
  if (typeof a === "string") return a;
  try {
    return JSON.stringify(a);
  } catch {
    return String(a);
  }
};
for (const level of ["log", "info", "warn", "error"] as const) {
  const original = console[level].bind(console);
  console[level] = (...args: unknown[]) => {
    original(...args);
    send({ type: "console", id: currentRun, level, text: args.map(fmt).join(" ") });
  };
}
window.addEventListener("error", (e) => send({ type: "error", id: currentRun, message: e.message }));
window.addEventListener("unhandledrejection", (e) =>
  send({ type: "error", id: currentRun, message: String((e.reason as Error)?.message ?? e.reason) }),
);

window.addEventListener("message", (e: MessageEvent<ToPreview>) => {
  if (e.source !== parent || e.data?.type !== "run") return;
  run(e.data.id, e.data.code).catch((err: Error) => send({ type: "error", id: e.data.id, message: err.message }));
});

send({ type: "ready" });
