import { redirect } from "next/navigation";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { getSession } from "@/lib/session";
import { PORTALS } from "@/lib/portals";
import { HomeIcon, UsersIcon, ToothIcon, ClipboardIcon } from "@/components/ui/Icons";

const NAV: NavItem[] = [
  { href: "dashboard", label: "الرئيسية", icon: <HomeIcon size={16} /> },
  { href: "triage-queue", label: "قائمة انتظار الفرز", icon: <UsersIcon size={16} /> },
  { href: "cases/new", label: "إضافة حالة سريرية", icon: <ToothIcon size={16} /> },
  { href: "cases", label: "سجل حالاتي", icon: <ClipboardIcon size={16} /> },
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
