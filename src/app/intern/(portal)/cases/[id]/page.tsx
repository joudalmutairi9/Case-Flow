import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { getSession } from "@/lib/session";
import { CaseForm } from "@/components/intern/CaseForm";
import { CASE_STATUS_LABEL_AR, CASE_STATUS_TONE } from "@/lib/case-status";

export default async function InternCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const clinicalCase = await prisma.clinicalCase.findUnique({
    where: { id },
    include: {
      patient: true,
      specialty: true,
      procedure: true,
      student: true,
      statusHistory: { orderBy: { createdAt: "desc" }, include: { changedBy: true } },
    },
  });

  if (!clinicalCase || clinicalCase.internId !== session!.userId) notFound();

  const canEdit = clinicalCase.status === "DRAFT" || clinicalCase.status === "NEEDS_REVISION";

  if (canEdit) {
    const [specialties, procedures] = await Promise.all([
      prisma.specialty.findMany({ where: { isActive: true } }),
      prisma.procedure.findMany({ where: { isActive: true } }),
    ]);

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-card-foreground" dir="ltr">
            {clinicalCase.caseNumber}
          </h1>
          <Badge tone={CASE_STATUS_TONE[clinicalCase.status]}>
            {CASE_STATUS_LABEL_AR[clinicalCase.status]}
          </Badge>
        </div>
        <Card>
          <CaseForm
            patients={[{ id: clinicalCase.patient.id, fullName: clinicalCase.patient.fullName, mrn: clinicalCase.patient.mrn }]}
            specialties={specialties}
            procedures={procedures.map((p) => ({
              id: p.id,
              nameAr: p.nameAr,
              specialtyId: p.specialtyId,
              difficulty: p.difficulty,
            }))}
            existingCase={{
              id: clinicalCase.id,
              patientId: clinicalCase.patientId,
              chiefComplaint: clinicalCase.chiefComplaint,
              medicalHistoryNote: clinicalCase.medicalHistoryNote,
              clinicalExamNote: clinicalCase.clinicalExamNote,
              toothFdi: clinicalCase.toothFdi,
              specialtyId: clinicalCase.specialtyId,
              procedureId: clinicalCase.procedureId,
              difficulty: clinicalCase.difficulty,
              requiredLevel: clinicalCase.requiredLevel,
              priority: clinicalCase.priority,
              priorityReason: clinicalCase.priorityReason,
              notesForStudent: clinicalCase.notesForStudent,
              reviewNote: clinicalCase.reviewNote,
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-card-foreground" dir="ltr">
          {clinicalCase.caseNumber}
        </h1>
        <Badge tone={CASE_STATUS_TONE[clinicalCase.status]}>
          {CASE_STATUS_LABEL_AR[clinicalCase.status]}
        </Badge>
      </div>

      <Card title="تفاصيل الحالة">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Info label="المريض" value={clinicalCase.patient.fullName} />
          <Info label="التخصص / الإجراء" value={`${clinicalCase.specialty.nameAr} / ${clinicalCase.procedure.nameAr}`} />
          <Info label="الشكوى الرئيسية" value={clinicalCase.chiefComplaint} />
          <Info label="السن (FDI)" value={clinicalCase.toothFdi ?? "—"} />
          <Info label="الطالب الحاجز" value={clinicalCase.student?.fullName ?? "لم تُحجز بعد"} />
          <Info label="الأولوية" value={clinicalCase.priority === "URGENT" ? "عاجلة" : "عادية"} />
        </dl>
      </Card>

      <Card title="سجل دورة الحياة">
        <ul className="flex flex-col gap-2 text-sm">
          {clinicalCase.statusHistory.map((h) => (
            <li key={h.id} className="rounded-lg border border-border px-3 py-2">
              <span className="font-medium">{CASE_STATUS_LABEL_AR[h.toStatus]}</span>
              {h.note && <span className="text-muted"> — {h.note}</span>}
              <div className="text-xs text-muted">{h.createdAt.toLocaleString("ar-SA")}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-medium text-card-foreground">{value}</dd>
    </div>
  );
}
