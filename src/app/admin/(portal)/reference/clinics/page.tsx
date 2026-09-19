import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { CreateClinicForm, ToggleClinicButton } from "@/components/admin/ReferenceForms";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteClinicAction } from "@/lib/actions/reference-data";

export default async function ClinicsPage() {
  const clinics = await prisma.clinic.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">العيادات</h1>
        <p className="text-sm text-muted">عيادات الطلاب والعيادات التخصصية المتاحة للحجز</p>
      </div>

      <Card title="إضافة عيادة">
        <CreateClinicForm />
      </Card>

      <Card title={`العيادات (${clinics.length})`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-right text-muted">
              <th className="pb-2">الاسم</th>
              <th className="pb-2">النوع</th>
              <th className="pb-2">الحالة</th>
              <th className="pb-2">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((clinic) => (
              <tr key={clinic.id} className="border-b border-border last:border-0">
                <td className="py-2">{clinic.name}</td>
                <td className="py-2">{clinic.type === "STUDENT" ? "عيادة طلاب" : "عيادة تخصصية"}</td>
                <td className="py-2">
                  {clinic.isActive ? <Badge tone="success">مفعّلة</Badge> : <Badge tone="warning">معطّلة</Badge>}
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <ToggleClinicButton id={clinic.id} isActive={clinic.isActive} />
                    <DeleteButton
                      action={deleteClinicAction.bind(null, clinic.id)}
                      confirmMessage={`تأكيد حذف عيادة "${clinic.name}"؟`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {clinics.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-center text-muted">
                  لا توجد عيادات بعد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
