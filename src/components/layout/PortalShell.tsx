import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "./LogoutButton";
import type { PortalKey } from "@/lib/portals";
import { ROLE_LABEL_AR } from "@/lib/portals";
import type { SessionPayload } from "@/lib/session";

export type NavItem = { href: string; label: string };

export function PortalShell({
  portal,
  portalName,
  session,
  nav,
  children,
  searchAction,
  quickLinks,
  footer,
}: {
  portal: PortalKey;
  portalName: string;
  session: SessionPayload;
  nav: NavItem[];
  children: ReactNode;
  /** Path (relative to the portal) a top search box GETs to, e.g. "search". */
  searchAction?: string;
  /** Small icon links shown next to the search box (notifications, today...). */
  quickLinks?: { href: string; label: string; icon: ReactNode }[];
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-64 shrink-0 flex-col border-l border-border bg-primary text-primary-foreground md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-sm font-bold">
            CF
          </div>
          <div>
            <p className="text-sm font-bold">{portalName}</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={`/${portal}/${item.href}`}
              className="rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted md:hidden">{portalName}</div>
            {searchAction && (
              <form action={`/${portal}/${searchAction}`} method="get" className="hidden sm:block">
                <input
                  name="q"
                  placeholder="بحث بالاسم أو رقم الملف أو رقم الحالة..."
                  className="w-64 rounded-lg border border-border bg-page-bg px-3 py-1.5 text-sm outline-none focus:border-primary lg:w-80"
                />
              </form>
            )}
          </div>

          <div className="flex items-center gap-3">
            {quickLinks?.map((q) => (
              <Link
                key={q.href}
                href={`/${portal}/${q.href}`}
                title={q.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-page-bg hover:text-primary"
              >
                {q.icon}
              </Link>
            ))}
            <div className="hidden text-sm text-muted md:block">
              <span className="font-bold text-card-foreground">{session.fullName}</span>
              <span className="mx-2 text-border">|</span>
              {ROLE_LABEL_AR[session.role]}
            </div>
            <Link
              href={`/${portal}/change-password`}
              className="hidden text-sm text-muted hover:text-primary sm:inline"
            >
              تغيير كلمة المرور
            </Link>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 bg-page-bg p-4 sm:p-6">{children}</main>
        {footer}
      </div>
    </div>
  );
}
