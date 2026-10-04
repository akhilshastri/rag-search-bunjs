import { Card } from "@demo/ui";

export interface StatCardProps {
  label: string;
  value: string | number;
  /** Change versus the previous period, in percent. */
  delta?: number;
}

export default function StatCard({ label, value, delta }: StatCardProps) {
  return (
    <Card title={label}>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      {delta !== undefined && (
        <div style={{ color: delta >= 0 ? "#16a34a" : "#dc2626" }}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
        </div>
      )}
    </Card>
  );
}
