export interface RatingProps {
    /** Current rating, from 0 to max. */
    value: number;
    max?: number;
}
export default function Rating({ value, max }: RatingProps): import("react").JSX.Element;
