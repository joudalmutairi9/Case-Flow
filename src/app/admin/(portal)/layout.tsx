import { redirect } from "next/navigation";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { getSession } from "@/lib/session";
import { PORTALS } from "@/lib/portals";

const NAV: NavItem[] = [
  { href: "dashboard", label: "الرئيسية" },
  { href: "users", label: "إدارة المستخدمين" },
  { href: "reference/specialties", label: "التخصصات والإجراءات" },
  { href: "reference/clinics", label: "العيادات" },
  { href: "reference/quotas", label: "الفترات وحصص التخرج" },
  { href: "groups", label: "مجموعات الإشراف" },
  { href: "notification-templates", label: "قوالب الإشعارات" },
  { href: "audit-log", label: "سجل التدقيق" },
  { href: "settings", label: "إعدادات النظام" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/admin/login");

  return (
    <PortalShell portal="admin" portalName={PORTALS.admin.nameAr} session={session} nav={NAV}>
      {children}
    </PortalShell>
  );
}
