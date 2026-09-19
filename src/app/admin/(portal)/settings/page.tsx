import { getSettings } from "@/lib/settings";
import { Card } from "@/components/ui/Card";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">إعدادات النظام وقواعد الحجز</h1>
        <p className="text-sm text-muted">القيم القابلة للضبط في قواعد العمل (القسم 12 من الوثيقة)</p>
      </div>
      <Card>
        <SettingsForm settings={settings} />
      </Card>
    </div>
  );
}
