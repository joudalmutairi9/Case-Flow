import { redirect } from "next/navigation";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { getSession } from "@/lib/session";
import { PORTALS } from "@/lib/portals";

const NAV: NavItem[] = [
  { href: "dashboard", label: "الرئيسية" },
  { href: "case-bank", label: "بنك الحالات" },
  { href: "my-cases", label: "حالاتي" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") redirect("/student/login");

  return (
    <PortalShell portal="student" portalName={PORTALS.student.nameAr} session={session} nav={NAV}>
      {children}
    </PortalShell>
  );
}
