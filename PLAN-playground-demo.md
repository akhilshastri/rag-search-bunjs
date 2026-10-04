# Playground Demo — Plan for a Small Working Example

Goal: prove the "feature documentation with live editing" idea end to end, small.
A user edits example code in Monaco and sees the result in an iframe, using components
from a **federated remote** and a **shared lib**. No per-user server: everything runs in the browser.

## Scope
In: shared lib, one remote with 3 components, docs host with Monaco + live preview iframe,
type-aware autocomplete, error and console capture, 4 example snippets, one browser test.
Out (later): versioning, share links/server, props controls, auth, real docs content/MDX, mobile.

## Repo layout (Bun workspaces)
```
package.json                 workspaces + root scripts (dev, build, test)
packages/ui/                 shared lib "@demo/ui": Button, Card (+ theme CSS)
apps/remote/                 MF remote "remote" (port 3001): Counter, Rating, StatCard
apps/docs/                   docs host (port 3000)
  index.html -> src/main.tsx   docs UI: example list, Monaco, preview iframe, console panel
  preview.html -> src/preview.tsx   iframe runtime (MF host): transpile + run snippets
  src/examples.ts            example snippets
  src/types/*.d.ts           hand-written typings fed to Monaco
tests/playground.spec.ts     Playwright smoke test
```

## Stack
Bun (workspaces, scripts) · Rsbuild + `@module-federation/rsbuild-plugin` (Bun's bundler has no
Module Federation) · React 19 · Monaco (`@monaco-editor/react`, bundled locally, not CDN) ·
`sucrase` (in-browser JSX/TS transpile) · Playwright for the test.

Already verified: all of these install under Bun (scratch install succeeded).
Not yet verified: they work together at runtime. That is the point of the demo.

## How it works
1. Docs page shows an example list, a Monaco editor and an `<iframe src="/preview.html">`.
2. On edit (debounced), the docs page `postMessage`s `{type:"run", code}` to the iframe.
3. The iframe runtime transpiles with sucrase (imports become `require` calls) and scans
   the `require("...")` specifiers.
4. It resolves each: `react` and `@demo/ui` from the bundle, `remote/<Name>` via MF `loadRemote`.
5. It runs the code in a `new Function(require, exports, module)` wrapper, takes the default
   export as a component and renders it inside an error boundary.
6. Errors and `console.*` output are posted back and shown in a console panel.
7. React and `@demo/ui` are MF **shared singletons** so the host and remote use one instance.

## Monaco setup
- TS/JSX compiler options (`jsx: react-jsx`, ESNext, bundler resolution).
- `addExtraLib` with `.d.ts` for `react`-less minimal globals, `@demo/ui`, and `remote/*`
  so autocomplete and hover show real prop types.
- Workers bundled via `new Worker(new URL(...))`; no network needed.

## Build order
1. Root workspace + `packages/ui`.
2. `apps/remote` exposing three components; confirm `mf-manifest.json` is served on :3001.
3. `apps/docs` shell: Monaco + static iframe, no live run yet.
4. `preview.tsx` runtime: transpile, resolve, render, error boundary, console capture.
5. Wire `postMessage` protocol and the example list.
6. Add `.d.ts` typings for autocomplete.
7. Playwright test: load the page, edit the code, assert the preview output changes;
   also assert a syntax error shows in the console panel without crashing the page.
8. Root `bun run dev` starts both servers; README with run steps.

## Verification (definition of done)
- `bun install && bun run dev` starts docs (:3000) and remote (:3001).
- Default example renders a remote component and a shared-lib component in the preview.
- Changing a prop in the editor updates the preview without a full page reload.
- A syntax or runtime error shows in the console panel; the docs page stays alive.
- Autocomplete in Monaco lists real props for `Button` and `Counter`.
- Playwright smoke test passes headless on the pre-installed Chromium.

## Risks and fallbacks
- MF 2.0 runtime wiring on Rsbuild may need config tuning. Fallback: pin the plugin versions
  that work, or load the remote via `init` + `loadRemote` manually.
- Monaco workers under Rsbuild can be fiddly. Fallback: `@monaco-editor/react` with workers
  disabled (no IntelliSense), then fix.
- Same-origin iframe is used for the demo; production should use a separate sandbox origin
  with the `sandbox` attribute and CSP (documented, not built here).
- Bun runs the scripts; if an Rsbuild CLI misbehaves under Bun, run it via Node.

## Estimated size
About 12-15 source files, roughly 600-800 lines in total.

## Open questions (defaults I will use unless you say otherwise)
- Folder: build inside this repo (`rag-search-bunjs`), on the current branch. This repo was
  named for the earlier RAG idea; say if you want the demo elsewhere.
- Users edit usage snippets only, not component source.
- Components are simple stand-ins (Counter, Rating, StatCard) since your real ones are not here.
