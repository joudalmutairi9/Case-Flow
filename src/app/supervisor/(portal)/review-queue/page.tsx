import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import {
  ApprovalPanel,
  SignStartTreatmentButton,
  ApproveTreatmentPlanButton,
  EvaluationForm,
} from "@/components/supervisor/ReviewActions";

export default async function ReviewQueuePage() {
  const [pendingReview, awaitingSignStart, pendingEvaluation, specialties] = await Promise.all([
    prisma.clinicalCase.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { patient: true, specialty: true, procedure: true, intern: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.clinicalCase.findMany({
      where: { status: "SCHEDULED" },
      include: { patient: true, student: true, appointments: { orderBy: { scheduledAt: "desc" }, take: 1 } },
      orderBy: { appointmentConfirmBy: "asc" },
    }),
    prisma.clinicalCase.findMany({
      where: { status: "PENDING_EVALUATION" },
      include: { patient: true, student: true, specialty: true, procedure: true },
      orderBy: { updatedAt: "asc" },
    }),
    prisma.specialty.findMany({ where: { isActive: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">بحاجة لإجرائك الآن</h1>
        <p className="text-sm text-muted">مرتبة حسب الأقدم فالأحدث</p>
      </div>

      <Card title={`حالات بانتظار اعتماد الطرح (${pendingReview.length})`}>
        <div className="flex flex-col gap-4">
          {pendingReview.map((c) => (
            <div key={c.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs text-muted" dir="ltr">
                    {c.caseNumber}
                  </span>
                  <p className="font-bold">
                    {c.patient.fullName} — {c.specialty.nameAr} / {c.procedure.nameAr}
                  </p>
                  <p className="text-sm text-muted">
                    طبيب الامتياز: {c.intern.fullName} · السن: {c.toothFdi ?? "—"}
                  </p>
                </div>
                {c.priority === "URGENT" && <Badge tone="danger">عاجلة</Badge>}
              </div>
              <p className="mt-2 text-sm">{c.chiefComplaint}</p>
              <ApprovalPanel
                caseId={c.id}
                specialties={specialties}
                currentSpecialtyId={c.specialtyId}
                currentDifficulty={c.difficulty}
                currentLevel={c.requiredLevel}
              />
            </div>
          ))}
          {pendingReview.length === 0 && <p className="text-sm text-muted">لا توجد حالات بانتظار الاعتماد.</p>}
        </div>
      </Card>

      <Card title={`مواعيد مؤكدة بانتظار توقيع بدء العلاج (${awaitingSignStart.length})`}>
        <div className="flex flex-col gap-3">
          {awaitingSignStart.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
            >
              <div>
                <p className="font-bold">{c.patient.fullName}</p>
                <p className="text-sm text-muted">
                  الطالب: {c.student?.fullName ?? "—"} · الموعد:{" "}
                  {c.appointments[0]?.scheduledAt.toLocaleString("ar-SA") ?? "—"}
                </p>
                {c.treatmentPlanFileUrl && (
                  <p className="text-sm text-muted">
                    خطة العلاج: <a href={c.treatmentPlanFileUrl} className="text-primary underline">عرض الملف</a>{" "}
                    {c.treatmentPlanApprovedAt ? <Badge tone="success">معتمدة</Badge> : <Badge tone="warning">بانتظار الاعتماد</Badge>}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {c.treatmentPlanFileUrl && !c.treatmentPlanApprovedAt && (
                  <ApproveTreatmentPlanButton caseId={c.id} />
                )}
                <SignStartTreatmentButton caseId={c.id} />
              </div>
            </div>
          ))}
          {awaitingSignStart.length === 0 && (
            <p className="text-sm text-muted">لا توجد مواعيد بانتظار توقيعك.</p>
          )}
        </div>
      </Card>

      <Card title={`حالات بانتظار تقييم الإنجاز (${pendingEvaluation.length})`}>
        <div className="flex flex-col gap-4">
          {pendingEvaluation.map((c) => (
            <div key={c.id} className="rounded-xl border border-border p-4">
              <p className="font-bold">
                {c.patient.fullName} — {c.specialty.nameAr} / {c.procedure.nameAr}
              </p>
              <p className="text-sm text-muted">الطالب: {c.student?.fullName ?? "—"}</p>
              {c.completionSummary && (
                <p className="mt-2 rounded-lg bg-page-bg p-2 text-sm">{c.completionSummary}</p>
              )}
              <div className="mt-3">
                <EvaluationForm caseId={c.id} />
              </div>
            </div>
          ))}
          {pendingEvaluation.length === 0 && (
            <p className="text-sm text-muted">لا توجد حالات بانتظار التقييم.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
