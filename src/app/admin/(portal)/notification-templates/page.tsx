import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { NotificationTemplateForm } from "@/components/admin/NotificationTemplateForm";

const CHANNEL_LABEL: Record<string, string> = {
  IN_APP: "داخل المنصة",
  EMAIL: "بريد إلكتروني",
  SMS: "SMS",
};

export default async function NotificationTemplatesPage() {
  const templates = await prisma.notificationTemplate.findMany({ orderBy: { eventKey: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">قوالب الإشعارات</h1>
        <p className="text-sm text-muted">نص كل إشعار والقناة التي يُرسل بها (القسم 13 من الوثيقة)</p>
      </div>

      <Card title="إضافة قالب جديد">
        <NotificationTemplateForm />
      </Card>

      {templates.map((t) => (
        <Card key={t.id} title={`${t.eventKey} — ${CHANNEL_LABEL[t.channel]}`}>
          <NotificationTemplateForm template={t} />
        </Card>
      ))}
    </div>
  );
}
