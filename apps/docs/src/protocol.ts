/** Messages exchanged between the docs page and the sandbox iframe. */
export type ToPreview = { type: "run"; id: number; code: string };

export type FromPreview =
  | { type: "ready" }
  | { type: "rendered"; id: number }
  | { type: "error"; id: number; message: string }
  | { type: "console"; id: number; level: "log" | "info" | "warn" | "error"; text: string };
