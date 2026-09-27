import { redirect } from "next/navigation";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { getSession } from "@/lib/session";
import { PORTALS } from "@/lib/portals";
import { HomeIcon, ClipboardIcon, BankIcon, GraduationCapIcon } from "@/components/ui/Icons";

const NAV: NavItem[] = [
  { href: "dashboard", label: "الرئيسية", icon: <HomeIcon size={16} /> },
  { href: "review-queue", label: "بحاجة لإجرائك الآن", icon: <ClipboardIcon size={16} /> },
  { href: "case-bank", label: "بنك الحالات", icon: <BankIcon size={16} /> },
  { href: "students", label: "تقدم الطلاب", icon: <GraduationCapIcon size={16} /> },
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
