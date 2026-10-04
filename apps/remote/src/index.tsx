import { createRoot } from "react-dom/client";
import Counter from "./Counter";
import Rating from "./Rating";
import StatCard from "./StatCard";

createRoot(document.getElementById("root")!).render(
  <div style={{ fontFamily: "sans-serif", padding: 24, display: "grid", gap: 16, maxWidth: 360 }}>
    <h3>remote (standalone view)</h3>
    <Counter />
    <Rating value={4} />
    <StatCard label="Users" value={1280} delta={3.2} />
  </div>,
);
