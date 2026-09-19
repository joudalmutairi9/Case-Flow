import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { getSession } from "@/lib/session";
import { CASE_STATUS_LABEL_AR, CASE_STATUS_TONE } from "@/lib/case-status";
import { releaseExpiredBookings } from "@/lib/case-lifecycle";
import {
  ConfirmAppointmentForm,
  CancelBookingForm,
  TreatmentPlanForm,
  CompletionForm,
} from "@/components/student/MyCaseActions";

export default async function MyCasesPage() {
  await releaseExpiredBookings();
  const session = await getSession();

  const [cases, clinics] = await Promise.all([
    prisma.clinicalCase.findMany({
      where: { studentId: session!.userId },
      include: {
        patient: true,
        specialty: true,
        procedure: true,
        appointments: { orderBy: { scheduledAt: "desc" }, take: 1 },
        evaluation: true,
      },
      orderBy: { bookedAt: "desc" },
    }),
    prisma.clinic.findMany({ where: { type: "STUDENT", isActive: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">حالاتي</h1>
        <p className="text-sm text-muted">كل الحالات المحجوزة والجارية والمكتملة</p>
      </div>

      <div className="flex flex-col gap-4">
        {cases.map((c) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted" dir="ltr">
                  {c.caseNumber}
                </p>
                <p className="font-bold">
                  {c.patient.fullName} — {c.specialty.nameAr} / {c.procedure.nameAr}
                </p>
                <p className="text-sm text-muted" dir="ltr">
                  {c.patient.phone}
                </p>
              </div>
              <Badge tone={CASE_STATUS_TONE[c.status]}>{CASE_STATUS_LABEL_AR[c.status]}</Badge>
            </div>

            {c.notesForStudent && (
              <p className="mt-2 rounded-lg bg-page-bg p-2 text-sm">
                ملاحظات طبيب الامتياز: {c.notesForStudent}
              </p>
            )}

            {c.status === "BOOKED" && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-warning">
                  يجب تأكيد الموعد قبل{" "}
                  {c.appointmentConfirmBy?.toLocaleString("ar-SA") ?? "—"}
                </p>
                <ConfirmAppointmentForm caseId={c.id} clinics={clinics} />
                <div className="mt-2">
                  <CancelBookingForm caseId={c.id} />
                </div>
              </div>
            )}

            {c.status === "SCHEDULED" && (
              <div className="mt-3 flex flex-col gap-3">
                <p className="text-sm text-muted">
                  الموعد: {c.appointments[0]?.scheduledAt.toLocaleString("ar-SA") ?? "—"}
                </p>
                {!c.treatmentPlanFileUrl ? (
                  <TreatmentPlanForm caseId={c.id} />
                ) : (
                  <p className="text-sm">
                    خطة العلاج: <a href={c.treatmentPlanFileUrl} className="text-primary underline">عرض</a>{" "}
                    {c.treatmentPlanApprovedAt ? (
                      <Badge tone="success">معتمدة</Badge>
                    ) : (
                      <Badge tone="warning">بانتظار اعتماد المشرف</Badge>
                    )}
                  </p>
                )}
                <CancelBookingForm caseId={c.id} />
              </div>
            )}

            {c.status === "IN_TREATMENT" && (
              <div className="mt-3">
                <CompletionForm caseId={c.id} />
              </div>
            )}

            {c.status === "PENDING_EVALUATION" && (
              <p className="mt-3 text-sm text-warning">بانتظار تقييم المشرف.</p>
            )}

            {c.status === "COMPLETED" && c.evaluation && (
              <p className="mt-3 text-sm text-success">
                اكتملت — الدرجة: {c.evaluation.score}/100
                {c.evaluation.rubricNotes && ` — ${c.evaluation.rubricNotes}`}
              </p>
            )}
          </Card>
        ))}
        {cases.length === 0 && (
          <Card>
            <p className="text-sm text-muted">لا توجد حالات محجوزة بعد. تصفّح بنك الحالات للبدء.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
