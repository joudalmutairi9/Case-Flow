import "server-only";
import { prisma } from "@/lib/prisma";

export const SETTINGS_KEYS = [
  "hospitalName",
  "timezone",
  "maxOpenBookingsPerStudent",
  "appointmentConfirmHours",
  "cancellationHours",
  "bankExpiryDays",
] as const;

export const SETTINGS_DEFAULTS: Record<(typeof SETTINGS_KEYS)[number], string> = {
  hospitalName: "المستشفى الجامعي لطب الأسنان",
  timezone: "Asia/Riyadh",
  maxOpenBookingsPerStudent: "3",
  appointmentConfirmHours: "24",
  cancellationHours: "12",
  bankExpiryDays: "14",
};

export async function getSettings() {
  const rows = await prisma.systemSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return SETTINGS_KEYS.reduce(
    (acc, key) => {
      acc[key] = map.get(key) ?? SETTINGS_DEFAULTS[key];
      return acc;
    },
    {} as Record<string, string>
  );
}
