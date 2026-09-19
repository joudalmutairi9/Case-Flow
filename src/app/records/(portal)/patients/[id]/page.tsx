import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { CallLogForm } from "@/components/records/CallLogForm";
import { archivePatientAction } from "@/lib/actions/patients";
import { SubmitButton } from "@/components/ui/SubmitButton";

const CALL_TYPE_LABEL: Record<string, string> = {
  REMINDER: "تذكير",
  CONFIRMATION: "تأكيد",
  FOLLOW_UP: "متابعة",
  COMPLAINT: "شكوى",
};

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      cases: { include: { specialty: true, procedure: true }, orderBy: { createdAt: "desc" } },
      calls: { orderBy: { createdAt: "desc" }, take: 20, include: { handledBy: true } },
    },
  });

  if (!patient) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-card-foreground">{patient.fullName}</h1>
          <p className="text-sm text-muted" dir="ltr">
            {patient.mrn}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {patient.status === "ACTIVE" ? (
            <Badge tone="success">نشط</Badge>
          ) : (
            <Badge tone="warning">مؤرشف</Badge>
          )}
          {patient.status === "ACTIVE" && (
            <form action={archivePatientAction.bind(null, patient.id)}>
              <SubmitButton variant="ghost">أرشفة الملف</SubmitButton>
            </form>
          )}
        </div>
      </div>

      <Card title="بيانات المريض">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <Info label="رقم الهوية" value={patient.nationalId} />
          <Info label="تاريخ الميلاد" value={patient.dob.toLocaleDateString("ar-SA")} />
          <Info label="الجنس" value={patient.gender === "MALE" ? "ذكر" : "أنثى"} />
          <Info label="الجوال" value={patient.phone} />
          <Info label="العنوان" value={patient.address ?? "—"} />
          <Info label="جهة اتصال الطوارئ" value={patient.emergencyContact ?? "—"} />
          <Info label="الأمراض المزمنة" value={patient.chronicConditions ?? "—"} />
          <Info label="الحساسية" value={patient.allergies ?? "—"} />
          <Info label="تاريخ التسجيل" value={patient.createdAt.toLocaleDateString("ar-SA")} />
        </dl>
      </Card>

      <Card title={`الحالات السريرية (${patient.cases.length})`}>
        {patient.cases.length === 0 ? (
          <p className="text-sm text-muted">لا توجد حالات مسجلة بعد لهذا المريض.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {patient.cases.map((c) => (
              <li key={c.id} className="rounded-lg border border-border px-3 py-2">
                <span className="font-mono text-xs text-muted" dir="ltr">
                  {c.caseNumber}
                </span>{" "}
                — {c.specialty.nameAr} / {c.procedure.nameAr}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="سجل المكالمات">
        <CallLogForm patientId={patient.id} />
        <ul className="mt-4 flex flex-col gap-2 text-sm">
          {patient.calls.map((call) => (
            <li key={call.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span>
                {call.direction === "INBOUND" ? "واردة" : "صادرة"} — {CALL_TYPE_LABEL[call.type]}
                {call.outcome && <span className="text-muted"> ({call.outcome})</span>}
              </span>
              <span className="text-xs text-muted">{call.createdAt.toLocaleString("ar-SA")}</span>
            </li>
          ))}
          {patient.calls.length === 0 && <li className="text-muted">لا توجد مكالمات مسجلة.</li>}
        </ul>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-medium text-card-foreground">{value}</dd>
    </div>
  );
}
