import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string }>;
}) {
  const { q, action } = await searchParams;

  const logs = await prisma.auditLog.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { actorUsername: { contains: q, mode: "insensitive" } },
                { entityId: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        action ? { action: { contains: action, mode: "insensitive" } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">سجل التدقيق</h1>
        <p className="text-sm text-muted">كل عملية حساسة على المنصة (SA-13)</p>
      </div>

      <Card>
        <form className="flex flex-wrap gap-3" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="اسم المستخدم أو معرّف العنصر"
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
          <input
            name="action"
            defaultValue={action}
            placeholder="نوع العملية (مثال: LOGIN)"
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            بحث
          </button>
        </form>
      </Card>

      <Card title={`النتائج (${logs.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-muted">
                <th className="pb-2">الوقت</th>
                <th className="pb-2">المستخدم</th>
                <th className="pb-2">العملية</th>
                <th className="pb-2">العنصر</th>
                <th className="pb-2">IP</th>
                <th className="pb-2">النتيجة</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="py-2 text-muted">{log.createdAt.toLocaleString("ar-SA")}</td>
                  <td className="py-2">{log.actorUsername ?? "—"}</td>
                  <td className="py-2 font-mono text-xs">{log.action}</td>
                  <td className="py-2 text-muted">
                    {log.entityType ? `${log.entityType} · ${log.entityId?.slice(0, 8)}` : "—"}
                  </td>
                  <td className="py-2 text-muted">{log.ip ?? "—"}</td>
                  <td className="py-2">
                    {log.success ? <Badge tone="success">تمت</Badge> : <Badge tone="danger">فشلت</Badge>}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted">
                    لا توجد سجلات مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
