import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { CreateGroupForm, AssignStudentForm, AssignInternForm } from "@/components/admin/GroupForms";

export default async function GroupsPage() {
  const [supervisorProfiles, students, interns, groups] = await Promise.all([
    prisma.supervisorProfile.findMany({ include: { user: true } }),
    prisma.studentProfile.findMany({ include: { user: true, group: true } }),
    prisma.internProfile.findMany({ include: { user: true, group: true } }),
    prisma.supervisionGroup.findMany({ include: { supervisor: { include: { user: true } } } }),
  ]);
  // createSupervisionGroupAction expects SupervisorProfile.id, not User.id.
  const supervisors = supervisorProfiles.map((sp) => ({ id: sp.id, fullName: sp.user.fullName }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">مجموعات الإشراف</h1>
        <p className="text-sm text-muted">ربط المشرفين بمجموعات الطلاب وأطباء الامتياز</p>
      </div>

      <Card title="إنشاء مجموعة">
        {supervisors.length === 0 ? (
          <p className="text-sm text-muted">أضف حساب مشرف واحد على الأقل أولاً.</p>
        ) : (
          <CreateGroupForm supervisors={supervisors} />
        )}
      </Card>

      <Card title={`المجموعات (${groups.length})`}>
        <ul className="flex flex-col gap-2 text-sm">
          {groups.map((g) => (
            <li key={g.id} className="rounded-lg border border-border px-3 py-2">
              <span className="font-bold">{g.name}</span>
              <span className="text-muted"> — المشرف: {g.supervisor.user.fullName}</span>
            </li>
          ))}
          {groups.length === 0 && <li className="text-muted">لا توجد مجموعات بعد.</li>}
        </ul>
      </Card>

      <Card title="تعيين طالب لمجموعة">
        {students.length === 0 || groups.length === 0 ? (
          <p className="text-sm text-muted">أضف طلاباً ومجموعات أولاً.</p>
        ) : (
          <AssignStudentForm
            students={students.map((s) => ({ id: s.id, fullName: s.user.fullName }))}
            groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          />
        )}
        <ul className="mt-4 flex flex-col gap-1 text-sm text-muted">
          {students.map((s) => (
            <li key={s.id}>
              {s.user.fullName} — {s.group ? s.group.name : "بدون مجموعة"}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="تعيين طبيب امتياز لمجموعة">
        {interns.length === 0 || groups.length === 0 ? (
          <p className="text-sm text-muted">أضف أطباء امتياز ومجموعات أولاً.</p>
        ) : (
          <AssignInternForm
            interns={interns.map((s) => ({ id: s.id, fullName: s.user.fullName }))}
            groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          />
        )}
        <ul className="mt-4 flex flex-col gap-1 text-sm text-muted">
          {interns.map((s) => (
            <li key={s.id}>
              {s.user.fullName} — {s.group ? s.group.name : "بدون مجموعة"}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
