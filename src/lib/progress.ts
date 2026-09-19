import "server-only";
import { prisma } from "./prisma";

export async function getStudentProgress(studentProfileId: string, level: string) {
  const activePeriod = await prisma.academicPeriod.findFirst({ where: { isActive: true } });
  if (!activePeriod) return { items: [], completed: 0, required: 0, percent: 0 };

  const [quotas, completedBySpecialty] = await Promise.all([
    prisma.graduationQuota.findMany({
      where: { level, academicTermId: activePeriod.id },
      include: { specialty: true },
    }),
    prisma.clinicalCase.groupBy({
      by: ["specialtyId"],
      where: { studentProfileId, status: "COMPLETED" },
      _count: { _all: true },
    }),
  ]);

  const completedMap = new Map(completedBySpecialty.map((c) => [c.specialtyId, c._count._all]));

  const items = quotas.map((q) => ({
    specialtyNameAr: q.specialty.nameAr,
    required: q.requiredCount,
    completed: completedMap.get(q.specialtyId) ?? 0,
  }));

  const completed = items.reduce((sum, i) => sum + Math.min(i.completed, i.required), 0);
  const required = items.reduce((sum, i) => sum + i.required, 0);

  return {
    items,
    completed,
    required,
    percent: required > 0 ? Math.round((completed / required) * 100) : 0,
  };
}
