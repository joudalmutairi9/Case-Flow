import { Card } from "@/components/ui/Card";

export default function DataPolicyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">سياسة البيانات الطبية وتوثيق الحالات</h1>
        <p className="text-sm text-muted">التزام المنصة بحماية بيانات المرضى وتتبع كل وصول إليها</p>
      </div>

      <Card title="حماية بيانات المريض">
        <ul className="list-inside list-disc space-y-2 text-sm text-card-foreground">
          <li>يُعرض للطالب العمر والجنس فقط قبل الحجز، وتُكشف بقية بيانات المريض بعد الحجز مباشرة.</li>
          <li>كل اطلاع أو تعديل على ملف مريض أو حالة سريرية يُسجَّل في سجل التدقيق (المستخدم، الوقت، IP).</li>
          <li>لا يُحذف أي سجل طبي نهائياً؛ يُعطَّل أو يُؤرشف فقط.</li>
          <li>الاتصال بالمنصة مشفّر بالكامل (HTTPS)، وكلمات المرور مخزَّنة بتشفير أحادي الاتجاه.</li>
        </ul>
      </Card>

      <Card title="توثيق الحالات">
        <ul className="list-inside list-disc space-y-2 text-sm text-card-foreground">
          <li>لكل حالة سريرية سجل كامل لدورة حياتها من الإنشاء حتى الاحتساب في حصة الطالب.</li>
          <li>لا يمكن تعديل التشخيص أو الإجراء بعد حجز الحالة إلا عبر المشرف.</li>
          <li>علاج القُصَّر يتطلب توثيق موافقة ولي الأمر قبل البدء.</li>
        </ul>
      </Card>
    </div>
  );
}
