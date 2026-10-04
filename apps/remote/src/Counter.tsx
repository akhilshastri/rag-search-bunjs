import { useState } from "react";
import { Button } from "@demo/ui";

export interface CounterProps {
  /** Starting value. */
  initial?: number;
  /** Amount added or removed per click. */
  step?: number;
  label?: string;
}

export default function Counter({ initial = 0, step = 1, label = "Count" }: CounterProps) {
  const [n, setN] = useState(initial);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button variant="secondary" onClick={() => setN(n - step)}>-</Button>
      <span>{label}: <b>{n}</b></span>
      <Button onClick={() => setN(n + step)}>+</Button>
    </div>
  );
}
