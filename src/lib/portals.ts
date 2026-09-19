import type { Role } from "@prisma/client";

export type PortalKey = "admin" | "records" | "intern" | "student" | "supervisor";

export const PORTALS: Record<
  PortalKey,
  { role: Role; nameAr: string; usernameHintAr: string }
> = {
  admin: {
    role: "SUPER_ADMIN",
    nameAr: "بوابة السوبر أدمن",
    usernameHintAr: "اسم المستخدم المخصص",
  },
  records: {
    role: "RECORDS",
    nameAr: "بوابة السجلات الطبية",
    usernameHintAr: "الرقم الوظيفي",
  },
  intern: {
    role: "INTERN",
    nameAr: "بوابة طبيب الامتياز",
    usernameHintAr: "الرقم الجامعي أو رقم الامتياز",
  },
  student: {
    role: "STUDENT",
    nameAr: "بوابة الطالب",
    usernameHintAr: "الرقم الجامعي",
  },
  supervisor: {
    role: "SUPERVISOR",
    nameAr: "بوابة الطبيب المشرف",
    usernameHintAr: "الرقم الوظيفي",
  },
};

export const ROLE_TO_PORTAL: Record<Role, PortalKey> = {
  SUPER_ADMIN: "admin",
  RECORDS: "records",
  INTERN: "intern",
  STUDENT: "student",
  SUPERVISOR: "supervisor",
};

export const ROLE_LABEL_AR: Record<Role, string> = {
  SUPER_ADMIN: "سوبر أدمن",
  RECORDS: "موظف سجلات طبية",
  INTERN: "طبيب امتياز",
  STUDENT: "طالب",
  SUPERVISOR: "طبيب مشرف",
};

export function isPortalKey(value: string): value is PortalKey {
  return value in PORTALS;
}

// Session idle timeout per role (section 5.2 AUTH-06)
export const SESSION_TTL_MINUTES: Record<Role, number> = {
  SUPER_ADMIN: 15,
  RECORDS: 15,
  INTERN: 30,
  STUDENT: 30,
  SUPERVISOR: 30,
};
