"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "ghost";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const base =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : variant === "danger"
        ? "bg-danger text-white hover:opacity-90"
        : "border border-border text-card-foreground hover:bg-page-bg";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${base} ${className}`}
    >
      {pending ? "..." : children}
    </button>
  );
}
