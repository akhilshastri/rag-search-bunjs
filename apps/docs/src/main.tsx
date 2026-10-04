import "./monaco-setup";
import "./styles.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Editor from "@monaco-editor/react";
import { examples } from "./examples";
import type { FromPreview, ToPreview } from "./protocol";

interface Line {
  level: "log" | "info" | "warn" | "error";
  text: string;
}

function App() {
  const [exampleId, setExampleId] = useState(examples[0].id);
  const [codes, setCodes] = useState<Record<string, string>>(() =>
    Object.fromEntries(examples.map((e) => [e.id, e.code])),
  );
  const [lines, setLines] = useState<Line[]>([]);
  const [status, setStatus] = useState("loading preview…");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const runId = useRef(0);

  const example = examples.find((e) => e.id === exampleId)!;
  const code = codes[exampleId];

  const run = useCallback((src: string) => {
    if (!readyRef.current) return; // sent when the iframe reports ready
    const id = ++runId.current;
    setLines([]);
    setStatus("running…");
    const msg: ToPreview = { type: "run", id, code: src };
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  }, []);

  // Messages from the sandbox iframe.
  const codeRef = useRef(code);
  codeRef.current = code;
  useEffect(() => {
    const onMessage = (e: MessageEvent<FromPreview>) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const m = e.data;
      if (m.type === "ready") {
        readyRef.current = true;
        run(codeRef.current);
      } else if (m.type === "rendered" && m.id === runId.current) {
        setStatus("ok");
      } else if (m.type === "error" && m.id === runId.current) {
        setStatus("error");
        setLines((l) => [...l, { level: "error", text: m.message }]);
      } else if (m.type === "console" && m.id === runId.current) {
        setLines((l) => [...l, { level: m.level, text: m.text }]);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [run]);

  // Re-run (debounced) whenever the code or the selected example changes.
  useEffect(() => {
    const t = setTimeout(() => run(code), 300);
    return () => clearTimeout(t);
  }, [code, run]);

  return (
    <div className="app">
      <header>
        <b>Playground</b>
        <span>{example.title}</span>
        <span className="spacer" />
        <span className="status" data-testid="status">{status}</span>
        <button onClick={() => setCodes((c) => ({ ...c, [exampleId]: example.code }))}>Reset</button>
      </header>
      <nav>
        {examples.map((e) => (
          <button key={e.id} className={e.id === exampleId ? "active" : ""} onClick={() => setExampleId(e.id)}>
            {e.title}
            <small>{e.description}</small>
          </button>
        ))}
      </nav>
      <div className="editor" data-testid="editor">
        <Editor
          height="100%"
          path={`file:///${exampleId}.tsx`}
          language="typescript"
          value={code}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
          onChange={(v) => setCodes((c) => ({ ...c, [exampleId]: v ?? "" }))}
        />
      </div>
      <div className="right">
        <iframe ref={iframeRef} src="/preview.html" title="preview" data-testid="preview" />
        <div className="console" data-testid="console">
          {lines.length === 0 && <span style={{ opacity: 0.5 }}>console</span>}
          {lines.map((l, i) => (
            <div key={i} className={l.level}>{l.text}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
