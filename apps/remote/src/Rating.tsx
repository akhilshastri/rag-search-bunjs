export interface RatingProps {
  /** Current rating, from 0 to max. */
  value: number;
  max?: number;
}

export default function Rating({ value, max = 5 }: RatingProps) {
  return (
    <span aria-label={`${value} of ${max}`} style={{ color: "#f59e0b", fontSize: 20 }}>
      {Array.from({ length: max }, (_, i) => (i < value ? "★" : "☆")).join("")}
    </span>
  );
}
