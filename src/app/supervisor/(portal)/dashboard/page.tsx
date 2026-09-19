import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/Kpi";
import { getSession } from "@/lib/session";

export default async function SupervisorDashboardPage() {
  const session = await getSession();

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [pendingReview, pendingPlan, pendingEvaluation, studentsCount, laggingStudents] =
    await Promise.all([
      prisma.clinicalCase.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.clinicalCase.count({
        where: { status: "SCHEDULED", treatmentPlanApprovedAt: null, treatmentPlanFileUrl: { not: null } },
      }),
      prisma.clinicalCase.count({ where: { status: "PENDING_EVALUATION" } }),
      prisma.studentProfile.count(),
      prisma.clinicalCase.count({
        where: {
          status: "CANCELLED",
          updatedAt: { gte: fourteenDaysAgo },
        },
      }),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">مرحباً، {session!.fullName}</h1>
        <p className="text-sm text-muted">لوحة الطبيب المشرف — صمام الجودة في المنصة</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="حالات بانتظار اعتماد الطرح" value={pendingReview} tone="warning" />
        <KpiCard label="خطط علاج بانتظار الاعتماد" value={pendingPlan} tone="warning" />
        <KpiCard label="حالات بانتظار تقييم الإنجاز" value={pendingEvaluation} tone="warning" />
        <KpiCard label="عدد الطلاب" value={studentsCount} />
      </div>

      <Card title="ملاحظة">
        <p className="text-sm text-muted">
          الحالات الملغاة خلال آخر 14 يوماً: <b>{laggingStudents}</b>. راجع صفحة
          «بحاجة لإجرائك الآن» لكل ما ينتظر قرارك.
        </p>
      </Card>
    </div>
  );
}
