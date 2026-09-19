import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { getSession } from "@/lib/session";

export default async function AdminNotificationsPage() {
  const session = await getSession();
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">الإشعارات</h1>
        <p className="text-sm text-muted">تنبيهات النظام الموجهة لحسابك</p>
      </div>
      <Card>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted">لا توجد إشعارات حالياً.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="font-bold">{n.title}</p>
                  <p className="text-muted">{n.body}</p>
                </div>
                {!n.read && <Badge tone="warning">جديد</Badge>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
