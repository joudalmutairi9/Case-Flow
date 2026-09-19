import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import {
  CreateAcademicPeriodForm,
  SetActivePeriodButton,
  UpsertQuotaForm,
} from "@/components/admin/ReferenceForms";

export default async function QuotasPage() {
  const [periods, specialties, quotas] = await Promise.all([
    prisma.academicPeriod.findMany({ orderBy: { startDate: "desc" } }),
    prisma.specialty.findMany({ where: { isActive: true }, orderBy: { nameAr: "asc" } }),
    prisma.graduationQuota.findMany({
      include: { specialty: true, academicTerm: true },
      orderBy: [{ academicTermId: "desc" }, { level: "asc" }],
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">الفترات الأكاديمية وحصص التخرج</h1>
        <p className="text-sm text-muted">
          الحد الأدنى من الحالات في كل تخصص الذي يجب أن ينجزه الطالب ليتخرج
        </p>
      </div>

      <Card title="إضافة فترة أكاديمية">
        <CreateAcademicPeriodForm />
      </Card>

      <Card title="الفترات الأكاديمية">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-right text-muted">
              <th className="pb-2">الاسم</th>
              <th className="pb-2">البداية</th>
              <th className="pb-2">النهاية</th>
              <th className="pb-2">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="py-2">
                  {p.name} {p.isActive && <Badge tone="success">نشطة</Badge>}
                </td>
                <td className="py-2">{p.startDate.toLocaleDateString("ar-SA")}</td>
                <td className="py-2">{p.endDate.toLocaleDateString("ar-SA")}</td>
                <td className="py-2">
                  <SetActivePeriodButton id={p.id} isActive={p.isActive} />
                </td>
              </tr>
            ))}
            {periods.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-center text-muted">
                  لا توجد فترات بعد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card title="تحديد حصة">
        {periods.length === 0 || specialties.length === 0 ? (
          <p className="text-sm text-muted">أضف فترة أكاديمية وتخصصاً أولاً.</p>
        ) : (
          <UpsertQuotaForm specialties={specialties} periods={periods} />
        )}
      </Card>

      <Card title={`الحصص المحددة (${quotas.length})`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-right text-muted">
              <th className="pb-2">المستوى</th>
              <th className="pb-2">التخصص</th>
              <th className="pb-2">الفترة</th>
              <th className="pb-2">العدد المطلوب</th>
            </tr>
          </thead>
          <tbody>
            {quotas.map((q) => (
              <tr key={q.id} className="border-b border-border last:border-0">
                <td className="py-2">{q.level}</td>
                <td className="py-2">{q.specialty.nameAr}</td>
                <td className="py-2">{q.academicTerm.name}</td>
                <td className="py-2 font-bold text-primary">{q.requiredCount}</td>
              </tr>
            ))}
            {quotas.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-center text-muted">
                  لا توجد حصص محددة بعد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
