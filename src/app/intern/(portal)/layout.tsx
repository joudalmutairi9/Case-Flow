import { redirect } from "next/navigation";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { getSession } from "@/lib/session";
import { PORTALS } from "@/lib/portals";

const NAV: NavItem[] = [
  { href: "dashboard", label: "الرئيسية" },
  { href: "triage-queue", label: "قائمة انتظار الفرز" },
  { href: "cases/new", label: "إضافة حالة سريرية" },
  { href: "cases", label: "سجل حالاتي" },
];

export default async function InternLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "INTERN") redirect("/intern/login");

  return (
    <PortalShell portal="intern" portalName={PORTALS.intern.nameAr} session={session} nav={NAV}>
      {children}
    </PortalShell>
  );
}
