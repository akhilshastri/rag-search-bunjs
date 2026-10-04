import type { ReactNode } from "react";

export interface CardProps {
  /** Heading shown at the top of the card. */
  title?: string;
  children?: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: 16, background: "#fff" }}>
      {title && <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>}
      {children}
    </div>
  );
}
