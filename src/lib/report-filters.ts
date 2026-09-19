import "server-only";
import type { Prisma } from "@prisma/client";

export type ReportFilters = {
  studentName?: string;
  internName?: string;
  procedureId?: string;
  bookedFrom?: string;
  bookedTo?: string;
  createdFrom?: string;
  createdTo?: string;
};

export function buildCaseWhere(filters: ReportFilters): Prisma.ClinicalCaseWhereInput {
  const where: Prisma.ClinicalCaseWhereInput = {};

  if (filters.studentName) {
    where.student = { fullName: { contains: filters.studentName, mode: "insensitive" } };
  }
  if (filters.internName) {
    where.intern = { fullName: { contains: filters.internName, mode: "insensitive" } };
  }
  if (filters.procedureId) {
    where.procedureId = filters.procedureId;
  }
  if (filters.bookedFrom || filters.bookedTo) {
    where.bookedAt = {
      ...(filters.bookedFrom ? { gte: new Date(filters.bookedFrom) } : {}),
      ...(filters.bookedTo ? { lte: new Date(`${filters.bookedTo}T23:59:59`) } : {}),
    };
  }
  if (filters.createdFrom || filters.createdTo) {
    where.createdAt = {
      ...(filters.createdFrom ? { gte: new Date(filters.createdFrom) } : {}),
      ...(filters.createdTo ? { lte: new Date(`${filters.createdTo}T23:59:59`) } : {}),
    };
  }

  return where;
}
