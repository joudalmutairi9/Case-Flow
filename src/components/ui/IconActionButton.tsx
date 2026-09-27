"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import type { IconTone } from "./IconCircle";

const TONE_CLASS: Record<IconTone, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  accent: "bg-accent text-accent-foreground hover:opacity-90",
  tertiary: "bg-tertiary text-tertiary-foreground hover:opacity-90",
  danger: "bg-danger text-white hover:opacity-90",
  onDark: "bg-white/15 text-white hover:bg-white/25",
};

/** Circular icon-only submit button for a row action inside a <form>. */
export function IconActionButton({
  tone,
  label,
  icon,
  size = 32,
}: {
  tone: IconTone;
  label: string;
  icon: ReactNode;
  size?: number;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      title={label}
      aria-label={label}
      disabled={pending}
      className={`flex shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${TONE_CLASS[tone]}`}
      style={{ width: size, height: size }}
    >
      {icon}
    </button>
  );
}
