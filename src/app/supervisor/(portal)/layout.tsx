import { redirect } from "next/navigation";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { getSession } from "@/lib/session";
import { PORTALS } from "@/lib/portals";

const NAV: NavItem[] = [
  { href: "dashboard", label: "الرئيسية" },
  { href: "review-queue", label: "بحاجة لإجرائك الآن" },
  { href: "case-bank", label: "بنك الحالات" },
  { href: "students", label: "تقدم الطلاب" },
];

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "SUPERVISOR") redirect("/supervisor/login");

  return (
    <PortalShell portal="supervisor" portalName={PORTALS.supervisor.nameAr} session={session} nav={NAV}>
      {children}
    </PortalShell>
  );
}
