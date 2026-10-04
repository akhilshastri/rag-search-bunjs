import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import { typings } from "./types/typings";

// Bundle the editor and its workers locally instead of loading them from a CDN.
(self as any).MonacoEnvironment = {
  getWorker(_id: string, label: string) {
    if (label === "typescript" || label === "javascript") {
      return new Worker(new URL("../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js", import.meta.url), {
        type: "module",
      });
    }
    return new Worker(new URL("../node_modules/monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url), {
      type: "module",
    });
  },
};

loader.config({ monaco });

const ts = monaco.typescript.typescriptDefaults;
ts.setCompilerOptions({
  target: monaco.typescript.ScriptTarget.ESNext,
  module: monaco.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
  jsx: monaco.typescript.JsxEmit.ReactJSX,
  allowNonTsExtensions: true,
  strict: true,
  noEmit: true,
});
for (const t of typings) ts.addExtraLib(t.content, `file:///types/${t.name}`);

// Exposed so browser tests can read markers and set editor content.
(window as any).monaco = monaco;
