import { redirect } from "next/navigation";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { getSession } from "@/lib/session";
import { PORTALS } from "@/lib/portals";
import { HomeIcon, BankIcon, ClipboardIcon } from "@/components/ui/Icons";

const NAV: NavItem[] = [
  { href: "dashboard", label: "الرئيسية", icon: <HomeIcon size={16} /> },
  { href: "case-bank", label: "بنك الحالات", icon: <BankIcon size={16} /> },
  { href: "my-cases", label: "حالاتي", icon: <ClipboardIcon size={16} /> },
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
