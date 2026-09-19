import type { ReactNode } from "react";

export function Card({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-base font-bold text-card-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({
  tone = "default",
  children,
}: {
  tone?: "default" | "success" | "warning" | "danger";
  children: ReactNode;
}) {
  const cls =
    tone === "success"
      ? "bg-success-bg text-success"
      : tone === "warning"
        ? "bg-warning-bg text-warning"
        : tone === "danger"
          ? "bg-danger-bg text-danger"
          : "bg-primary/10 text-primary";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}
