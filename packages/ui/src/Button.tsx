import type { ReactNode } from "react";

export interface ButtonProps {
  /** Visual style of the button. */
  variant?: "primary" | "secondary" | "danger";
  /** Disables interaction. */
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

const colors = {
  primary: { bg: "#2563eb", fg: "#fff" },
  secondary: { bg: "#e5e7eb", fg: "#111827" },
  danger: { bg: "#dc2626", fg: "#fff" },
} as const;

export function Button({ variant = "primary", disabled, onClick, children }: ButtonProps) {
  const c = colors[variant];
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        background: c.bg,
        color: c.fg,
        border: 0,
        borderRadius: 6,
        padding: "8px 14px",
        font: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
