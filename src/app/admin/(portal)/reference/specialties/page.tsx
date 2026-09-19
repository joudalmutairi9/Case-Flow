import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import {
  CreateSpecialtyForm,
  ToggleSpecialtyButton,
  CreateProcedureForm,
  ToggleProcedureButton,
} from "@/components/admin/ReferenceForms";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteSpecialtyAction, deleteProcedureAction } from "@/lib/actions/reference-data";

const DIFFICULTY_LABEL: Record<string, string> = {
  SIMPLE: "بسيط",
  MEDIUM: "متوسط",
  COMPLEX: "معقد",
};

export default async function SpecialtiesPage() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { nameAr: "asc" },
    include: { procedures: { orderBy: { nameAr: "asc" } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">توزيع الحالات السريرية — التخصصات والخدمات</h1>
        <p className="text-sm text-muted">
          كل الخدمات السريرية المتاحة لطبيب الامتياز عند إنشاء حالة، مع خيار إضافة خدمة جديدة في أي وقت
        </p>
      </div>

      <Card title="إضافة تخصص">
        <CreateSpecialtyForm />
      </Card>

      <Card title="إضافة إجراء">
        <CreateProcedureForm specialties={specialties.map((s) => ({ id: s.id, nameAr: s.nameAr }))} />
      </Card>

      {specialties.map((specialty) => (
        <Card
          key={specialty.id}
          title={`${specialty.nameAr} (${specialty.nameEn})`}
          action={
            <div className="flex items-center gap-2">
              {specialty.isActive ? <Badge tone="success">مفعّل</Badge> : <Badge tone="warning">معطّل</Badge>}
              <ToggleSpecialtyButton id={specialty.id} isActive={specialty.isActive} />
              <DeleteButton
                action={deleteSpecialtyAction.bind(null, specialty.id)}
                confirmMessage={`تأكيد حذف تخصص "${specialty.nameAr}"؟`}
              />
            </div>
          }
        >
          <table className="w-full border-separate border-spacing-x-2 text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">الإجراء</th>
                <th className="pb-2">الصعوبة</th>
                <th className="pb-2">الحالة</th>
                <th className="pb-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {specialty.procedures.map((proc) => (
                <tr key={proc.id} className="border-b border-border last:border-0">
                  <td className="py-2">
                    {proc.nameAr} <span className="text-muted">({proc.nameEn})</span>
                  </td>
                  <td className="py-2">{DIFFICULTY_LABEL[proc.difficulty]}</td>
                  <td className="py-2">
                    {proc.isActive ? <Badge tone="success">مفعّل</Badge> : <Badge tone="warning">معطّل</Badge>}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <ToggleProcedureButton id={proc.id} isActive={proc.isActive} />
                      <DeleteButton
                        action={deleteProcedureAction.bind(null, proc.id)}
                        confirmMessage={`تأكيد حذف خدمة "${proc.nameAr}"؟`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {specialty.procedures.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-muted">
                    لا توجد إجراءات بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
}
