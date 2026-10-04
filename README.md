# Playground demo: live-editable component docs

Edit example code in Monaco and see it run in a sandboxed iframe, using components from a
**Module Federation remote** and a **shared lib**. Everything runs in the browser; there is no
server per user. See `PLAN-playground-demo.md` for the design.

## Run
```bash
bun install
bun run dev        # docs on http://localhost:3000, remote on http://localhost:3001
bun run test       # headless-browser tests (needs the dev servers running)
bun run build      # production builds of both apps
```
The test uses the Chromium at `/opt/pw-browsers/chromium`; override with `CHROMIUM_PATH`.
Point the docs host at a different remote with `REMOTE_ENTRY=https://.../mf-manifest.json`.

## Layout
- `packages/ui`: shared lib `@demo/ui` (Button, Card)
- `apps/remote`: federated remote exposing `Counter`, `Rating`, `StatCard`
- `apps/docs`: docs host
  - `src/main.tsx`: docs UI (example list, Monaco, preview iframe, console panel)
  - `src/preview.tsx`: sandbox runtime inside the iframe (sucrase transpile, import resolution, render)
  - `src/types/typings.ts`: type declarations fed to Monaco for autocomplete
  - `src/examples.ts`: example snippets
- `tests/playground.test.ts`: Playwright smoke tests

## How a snippet runs
1. Monaco edit, then (debounced) `postMessage` to the iframe.
2. The iframe transpiles with sucrase; imports become `require` calls.
3. `react` and `@demo/ui` resolve locally; `remote/*` resolves through `loadRemote`.
4. The default export is rendered inside an error boundary; errors and `console.*` go back to the page.

## Known limits (demo)
- The iframe is same-origin. For production or share links, serve it from a separate origin with the
  `sandbox` attribute and a CSP.
- The Monaco typings are hand-written; generate them from the built `.d.ts` files in a real setup.
- Sucrase does not validate JSX closing-tag names; Monaco still shows those errors.
- `window.monaco` is exposed for tests.
