import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  portalName,
  title,
  children,
}: {
  portalName: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
          >
            CF
          </Link>
          <h1 className="text-xl font-bold text-primary">{portalName}</h1>
          {title && <p className="mt-1 text-sm text-muted">{title}</p>}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
