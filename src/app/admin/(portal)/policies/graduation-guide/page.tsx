import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function GraduationGuidePage() {
  const period = await prisma.academicPeriod.findFirst({ where: { isActive: true } });
  const quotas = period
    ? await prisma.graduationQuota.findMany({
        where: { academicTermId: period.id },
        include: { specialty: true },
        orderBy: [{ level: "asc" }, { specialty: { nameAr: "asc" } }],
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">دليل استيفاء متطلبات التخرج</h1>
        <p className="text-sm text-muted">القواعد التي تحكم احتساب الحالة ضمن حصة الطالب</p>
      </div>

      <Card title="القواعد العامة">
        <ul className="list-inside list-disc space-y-2 text-sm text-card-foreground">
          <li>لا تُحتسب الحالة في الحصة إلا بعد تقييم المشرف واعتماده (BR-09).</li>
          <li>الحد الأقصى للحجوزات المفتوحة لكل طالب قابل للضبط من إعدادات النظام.</li>
          <li>يجب تأكيد الموعد مع المريض خلال المهلة المحددة، وإلا تعود الحالة للبنك تلقائياً.</li>
          <li>الإلغاء المتأخر أو عدم الحضور يُسجَّل على الطالب ويُبلَّغ المشرف.</li>
          <li>إذا تجاوز الطالب العدد المطلوب في تخصص، تُسجَّل الحالات الإضافية دون احتسابها ضمن الحد الأدنى.</li>
        </ul>
      </Card>

      <Card title={`حصص الفترة الأكاديمية النشطة${period ? `: ${period.name}` : ""}`}>
        {quotas.length === 0 ? (
          <p className="text-sm text-muted">لا توجد حصص محددة بعد لهذه الفترة.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">المستوى</th>
                <th className="pb-2">التخصص</th>
                <th className="pb-2">العدد المطلوب</th>
              </tr>
            </thead>
            <tbody>
              {quotas.map((q) => (
                <tr key={q.id} className="border-b border-border last:border-0">
                  <td className="py-2">{q.level}</td>
                  <td className="py-2">{q.specialty.nameAr}</td>
                  <td className="py-2 font-bold text-primary">{q.requiredCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
