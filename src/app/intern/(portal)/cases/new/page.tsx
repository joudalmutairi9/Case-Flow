import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { CaseForm } from "@/components/intern/CaseForm";

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const { patientId } = await searchParams;

  const [patients, specialties, procedures] = await Promise.all([
    prisma.patient.findMany({ where: { status: "ACTIVE" }, orderBy: { fullName: "asc" } }),
    prisma.specialty.findMany({ where: { isActive: true }, orderBy: { nameAr: "asc" } }),
    prisma.procedure.findMany({ where: { isActive: true }, orderBy: { nameAr: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">إضافة وتسجيل حالة سريرية جديدة</h1>
        <p className="text-sm text-muted">خطوة الفرز: فحص المريض ← تحديد التخصص والإجراء ← اعتماد المشرف</p>
      </div>
      <Card>
        <CaseForm
          patients={patients.map((p) => ({ id: p.id, fullName: p.fullName, mrn: p.mrn }))}
          specialties={specialties}
          procedures={procedures.map((p) => ({
            id: p.id,
            nameAr: p.nameAr,
            specialtyId: p.specialtyId,
            difficulty: p.difficulty,
          }))}
          defaultPatientId={patientId}
        />
      </Card>
    </div>
  );
}
