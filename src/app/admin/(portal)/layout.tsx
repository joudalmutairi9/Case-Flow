import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { getSession } from "@/lib/session";
import { PORTALS } from "@/lib/portals";
import { BellIcon, CalendarIcon } from "@/components/ui/Icons";

const NAV: NavItem[] = [
  { href: "dashboard", label: "الرئيسية والإحصائيات" },
  { href: "users", label: "إدارة المستخدمين" },
  { href: "students", label: "بوابة الطلاب والمتطلبات" },
  { href: "interns", label: "أطباء الامتياز" },
  { href: "reference/specialties", label: "توزيع الحالات السريرية" },
  { href: "case-bank", label: "بنك الحالات السريرية" },
  { href: "reports", label: "مركز التقارير" },
  { href: "reference/clinics", label: "العيادات" },
  { href: "groups", label: "مجموعات الإشراف" },
  { href: "notification-templates", label: "قوالب الإشعارات" },
  { href: "audit-log", label: "سجل التدقيق" },
  { href: "settings", label: "إعدادات النظام" },
];

function AdminFooter() {
  return (
    <footer className="border-t border-border bg-card px-6 py-4 text-center text-xs text-muted">
      <p>© {new Date().getFullYear()} جميع الحقوق محفوظة — المستشفى الجامعي لطب الأسنان</p>
      <div className="mt-1 flex justify-center gap-4">
        <Link href="/admin/policies/graduation-guide" className="hover:text-primary hover:underline">
          دليل استيفاء متطلبات التخرج
        </Link>
        <Link href="/admin/policies/data-policy" className="hover:text-primary hover:underline">
          سياسة البيانات الطبية وتوثيق الحالات
        </Link>
      </div>
    </footer>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/admin/login");

  return (
    <PortalShell
      portal="admin"
      portalName={PORTALS.admin.nameAr}
      session={session}
      nav={NAV}
      searchAction="search"
      quickLinks={[
        { href: "notifications", label: "الإشعارات", icon: <BellIcon /> },
        { href: "today", label: "مواعيد اليوم", icon: <CalendarIcon /> },
      ]}
      footer={<AdminFooter />}
    >
      {children}
    </PortalShell>
  );
}
