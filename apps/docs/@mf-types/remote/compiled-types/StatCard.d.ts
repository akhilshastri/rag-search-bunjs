export interface StatCardProps {
    label: string;
    value: string | number;
    /** Change versus the previous period, in percent. */
    delta?: number;
}
export default function StatCard({ label, value, delta }: StatCardProps): import("react").JSX.Element;
