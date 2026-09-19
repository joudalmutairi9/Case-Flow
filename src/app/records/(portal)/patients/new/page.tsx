import { Card } from "@/components/ui/Card";
import { PatientForm } from "@/components/records/PatientForm";

export default function NewPatientPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">تسجيل مريض جديد</h1>
        <p className="text-sm text-muted">يُولَّد رقم الملف (MRN) تلقائياً بعد الحفظ</p>
      </div>
      <Card>
        <PatientForm />
      </Card>
    </div>
  );
}
