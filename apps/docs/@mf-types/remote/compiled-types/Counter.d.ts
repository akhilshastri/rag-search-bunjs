export interface CounterProps {
    /** Starting value. */
    initial?: number;
    /** Amount added or removed per click. */
    step?: number;
    label?: string;
}
export default function Counter({ initial, step, label }: CounterProps): import("react").JSX.Element;
