/**
 * Hand-written type declarations fed to Monaco so the editor gives autocomplete and hover docs.
 * In a real setup these come from the built .d.ts of the shared lib and each remote.
 */
export const typings: { name: string; content: string }[] = [
  {
    name: "react.d.ts",
    content: `
declare module "react" {
  export type ReactNode = any;
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useRef<T>(initial: T): { current: T };
  const React: any;
  export default React;
}
declare module "react/jsx-runtime" {
  export namespace JSX {
    interface Element {}
    interface IntrinsicElements { [tag: string]: any }
  }
  export const jsx: any; export const jsxs: any; export const Fragment: any;
}
`,
  },
  {
    name: "demo-ui.d.ts",
    content: `
declare module "@demo/ui" {
  import type { ReactNode } from "react";
  export interface ButtonProps {
    /** Visual style of the button. */
    variant?: "primary" | "secondary" | "danger";
    /** Disables interaction. */
    disabled?: boolean;
    onClick?: () => void;
    children?: ReactNode;
  }
  export function Button(props: ButtonProps): JSX.Element;
  export interface CardProps {
    /** Heading shown at the top of the card. */
    title?: string;
    children?: ReactNode;
  }
  export function Card(props: CardProps): JSX.Element;
}
`,
  },
  {
    name: "remote.d.ts",
    content: `
declare module "remote/Counter" {
  export interface CounterProps {
    /** Starting value. */
    initial?: number;
    /** Amount added or removed per click. */
    step?: number;
    label?: string;
  }
  export default function Counter(props: CounterProps): JSX.Element;
}
declare module "remote/Rating" {
  export interface RatingProps {
    /** Current rating, from 0 to max. */
    value: number;
    max?: number;
  }
  export default function Rating(props: RatingProps): JSX.Element;
}
declare module "remote/StatCard" {
  export interface StatCardProps {
    label: string;
    value: string | number;
    /** Change versus the previous period, in percent. */
    delta?: number;
  }
  export default function StatCard(props: StatCardProps): JSX.Element;
}
declare namespace JSX {
  interface Element {}
  interface IntrinsicElements { [tag: string]: any }
}
`,
  },
];
