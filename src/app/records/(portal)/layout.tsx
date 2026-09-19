import { redirect } from "next/navigation";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { getSession } from "@/lib/session";
import { PORTALS } from "@/lib/portals";

const NAV: NavItem[] = [
  { href: "dashboard", label: "التقرير الأسبوعي" },
  { href: "patients/new", label: "تسجيل مريض جديد" },
  { href: "patients", label: "ملفات المرضى" },
];

export default async function RecordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "RECORDS") redirect("/records/login");

  return (
    <PortalShell portal="records" portalName={PORTALS.records.nameAr} session={session} nav={NAV}>
      {children}
    </PortalShell>
  );
}
