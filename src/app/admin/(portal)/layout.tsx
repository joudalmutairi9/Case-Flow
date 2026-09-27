import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { getSession } from "@/lib/session";
import { PORTALS } from "@/lib/portals";
import {
  BellIcon,
  CalendarIcon,
  HomeIcon,
  UsersIcon,
  GraduationCapIcon,
  StethoscopeIcon,
  TagIcon,
  BankIcon,
  ChartIcon,
  BuildingIcon,
  TeamIcon,
  MessageIcon,
  ClipboardIcon,
  GearIcon,
} from "@/components/ui/Icons";

const NAV: NavItem[] = [
  { href: "dashboard", label: "الرئيسية والإحصائيات", icon: <HomeIcon size={16} /> },
  { href: "users", label: "إدارة المستخدمين", icon: <UsersIcon size={16} /> },
  { href: "students", label: "بوابة الطلاب والمتطلبات", icon: <GraduationCapIcon size={16} /> },
  { href: "interns", label: "أطباء الامتياز", icon: <StethoscopeIcon size={16} /> },
  { href: "reference/specialties", label: "توزيع الحالات السريرية", icon: <TagIcon size={16} /> },
  { href: "case-bank", label: "بنك الحالات السريرية", icon: <BankIcon size={16} /> },
  { href: "reports", label: "مركز التقارير", icon: <ChartIcon size={16} /> },
  { href: "reference/clinics", label: "العيادات", icon: <BuildingIcon size={16} /> },
  { href: "groups", label: "مجموعات الإشراف", icon: <TeamIcon size={16} /> },
  { href: "notification-templates", label: "قوالب الإشعارات", icon: <MessageIcon size={16} /> },
  { href: "audit-log", label: "سجل التدقيق", icon: <ClipboardIcon size={16} /> },
  { href: "settings", label: "إعدادات النظام", icon: <GearIcon size={16} /> },
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
        { href: "notifications", label: "الإشعارات", icon: <BellIcon size={17} />, tone: "accent" },
        { href: "today", label: "مواعيد اليوم", icon: <CalendarIcon size={17} />, tone: "tertiary" },
      ]}
      footer={<AdminFooter />}
    >
      {children}
    </PortalShell>
  );
}
