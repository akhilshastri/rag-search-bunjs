export interface Example {
  id: string;
  title: string;
  description: string;
  code: string;
}

export const examples: Example[] = [
  {
    id: "button-card",
    title: "Button + Card (shared lib)",
    description: "Components from the shared library @demo/ui.",
    code: `import { Button, Card } from "@demo/ui";

export default function Demo() {
  return (
    <Card title="Shared lib demo">
      <p>Try changing the variant to "danger" or "secondary".</p>
      <Button variant="primary" onClick={() => console.log("clicked")}>
        Click me
      </Button>
    </Card>
  );
}
`,
  },
  {
    id: "counter",
    title: "Counter (remote)",
    description: "A component loaded at runtime from the federated remote.",
    code: `import Counter from "remote/Counter";

export default function Demo() {
  return <Counter initial={5} step={2} label="Items" />;
}
`,
  },
  {
    id: "dashboard",
    title: "Dashboard (remote + shared)",
    description: "Remote components composed with a shared-lib Card.",
    code: `import { Card } from "@demo/ui";
import StatCard from "remote/StatCard";
import Rating from "remote/Rating";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <StatCard label="Revenue" value="$12,400" delta={-4.5} />
      <Card title="Customer rating">
        <Rating value={4} max={5} />
      </Card>
    </div>
  );
}
`,
  },
  {
    id: "state-console",
    title: "State + console output",
    description: "Local React state; console output appears in the panel below.",
    code: `import { useState } from "react";
import { Button } from "@demo/ui";

export default function Demo() {
  const [name, setName] = useState("world");
  console.log("render with name =", name);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <div>Hello, {name}!</div>
      <Button variant="secondary" onClick={() => setName("")}>Clear</Button>
    </div>
  );
}
`,
  },
];
