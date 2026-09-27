import type { ReactNode } from "react";

export type IconTone = "primary" | "accent" | "tertiary" | "danger" | "onDark";

const TONE_CLASS: Record<IconTone, string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  tertiary: "bg-tertiary text-tertiary-foreground",
  danger: "bg-danger text-white",
  onDark: "bg-white/15 text-white",
};

export function IconCircle({
  tone = "primary",
  size = 32,
  children,
}: {
  tone?: IconTone;
  size?: number;
  children: ReactNode;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${TONE_CLASS[tone]}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {children}
    </span>
  );
}
